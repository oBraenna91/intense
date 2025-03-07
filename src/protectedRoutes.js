// import React, { useEffect, useState } from 'react';
// import { Route, Redirect } from 'react-router-dom';
// import { supabase } from './supabaseClient';
// import Layout from './layout';

// export default function ProtectedRoute({ component: Component, ...rest }) {
//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSession = async () => {
//       const { data } = await supabase.auth.getSession();
//       setSession(data?.session || null);
//       setLoading(false);
//     };
//     fetchSession();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Route
//       {...rest}
//       render={(props) =>
//         session ? (
//           <Layout>
//             <Component {...props} />
//           </Layout>
//         ) : (
//           <Redirect to="/login" />
//         )
//       }
//     />
//   );
// }
