import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';

const IndexRedirect = () => {
  const { user, loading, profile, coach } = useAuth();
  
  if (loading || !profile || (profile.role === 'coach' && !coach)) {
    return (
      <div className="col-12 d-flex justify-content-center mt-5 pt-5">
        Loading...
      </div>
    );
  }
  return user ? <Redirect to="/app" /> : <Redirect to="/login" />;
}

export default IndexRedirect;
