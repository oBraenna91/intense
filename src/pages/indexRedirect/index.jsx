import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';

const IndexRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Redirect to="/app" /> : <Redirect to="/login" />;
};

export default IndexRedirect;
