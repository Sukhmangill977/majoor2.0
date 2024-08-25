//by using this the person is redirected to sign-in even if he tries to go to profile page manually

import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'

export default function PrivateRoute() {
    const { currentUser } = useSelector(state => state.user)
    return currentUser ? <Outlet /> : <Navigate to='/sign-in' />//we create it beacase if the prson is not signed in he should be redirected to the dign in page
}
