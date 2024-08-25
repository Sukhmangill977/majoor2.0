import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserFailure, deleteUserSuccess, signOut } from '../redux/user/userSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const pdfRef = useRef(null); 
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null); 
  const [imagePercent, setImagePercent] = useState(0);
  const [pdfPercent, setPdfPercent] = useState(0); 
  const [imageError, setImageError] = useState(false);
  const [pdfError, setPdfError] = useState(false); 
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [pdfUrls, setPdfUrls] = useState([]); // State to hold the list of PDF URLs

  const { currentUser, loading, error } = useSelector(state => state.user);

  useEffect(() => {
    if (image) {
      handleFileUpload(image, 'profilePicture');
    }
  }, [image]);

  useEffect(() => {
    if (pdf) {
      handleFileUpload(pdf, 'pdfFile');
    }
  }, [pdf]);

  useEffect(() => {
    // Load the current user's PDF URLs when the component mounts
    if (currentUser?.pdfUrls) {
      setPdfUrls(currentUser.pdfUrls);
    }
  }, [currentUser]);

  const handleFileUpload = async (file, type) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (type === 'profilePicture') {
          setImagePercent(Math.round(progress));
        } else if (type === 'pdfFile') {
          setPdfPercent(Math.round(progress));
        }
      },
      (error) => {
        if (type === 'profilePicture') {
          setImageError(true);
        } else if (type === 'pdfFile') {
          setPdfError(true);
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          console.log(`Download URL for ${type}: `, downloadURL);
  
          if (type === 'pdfFile') {
            try {
              const res = await fetch(`/backend/user/upload/pdf/${currentUser._id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({ downloadURL }),
              });
              const data = await res.json();
              if (data.pdfUrls) {
                setPdfUrls(data.pdfUrls); // Update the PDF URLs in state
              }
            } catch (error) {
              console.error('Error updating PDF URLs:', error);
            }
          } else {
            setFormData({
              ...formData,
              [type]: downloadURL,
            });
          }
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const token = currentUser?.token; 
      const res = await fetch(`/backend/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ ...formData, profilePicture: formData.profilePicture, pdfFile: formData.pdfFile }),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/backend/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error));
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/backend/auth/signout');
      dispatch(signOut());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="file" ref={fileRef} hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <img
          src={formData.profilePicture || currentUser.profilePicture}
          alt="profile"
          className="h-24 w-24 self-center cursor-pointer rounded-full object-cover mt-2"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center">
          {imageError ? (
            <span className="text-red-700">Error uploading image</span>
          ) : imagePercent > 0 && imagePercent < 100 ? (
            <span className="text-slate-700">{`Uploading image: ${imagePercent} %`}</span>
          ) : imagePercent === 100 ? (
            <span className="text-green-700">Image Uploaded Successfully</span>
          ) : (
            ''
          )}
        </p>

        <input defaultValue={currentUser.username} type="text" id="username" placeholder="Username" className="bg-slate-100 rounded-lg p-3" onChange={handleChange} />
        <input defaultValue={currentUser.email} type="email" id="email" placeholder="Email" className="bg-slate-100 rounded-lg p-3" onChange={handleChange} />
        <input type="password" id="password" placeholder="Password" className="bg-slate-100 rounded-lg p-3" onChange={handleChange} />

        <div className="mt-5">
          <label className="block mb-2 font-semibold">Upload PDF</label>
          <input type="file" ref={pdfRef} accept="application/pdf" onChange={(e) => setPdf(e.target.files[0])} />
        </div>
        <p className="text-sm self-center mt-2">
          {pdfError ? (
            <span className="text-red-700">Error uploading PDF</span>
          ) : pdfPercent > 0 && pdfPercent < 100 ? (
            <span className="text-slate-700">{`Uploading PDF: ${pdfPercent} %`}</span>
          ) : pdfPercent === 100 ? (
            <span className="text-green-700">PDF Uploaded Successfully</span>
          ) : (
            ''
          )}
        </p>

        <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          {loading ? 'Loading...' : 'Update'}
        </button>
      </form>

      <h2 className="text-xl mt-5">Uploaded PDFs</h2>
      <div className="mt-2">
        {pdfUrls.length > 0 ? (
          pdfUrls.map((url, index) => (
            <div key={index} className="mt-2">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                PDF {index + 1}
              </a>
            </div>
          ))
        ) : (
          <p>No PDFs uploaded yet.</p>
        )}
      </div>

      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteAccount} className="text-red-700 cursor-pointer">Delete Account</span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
}
