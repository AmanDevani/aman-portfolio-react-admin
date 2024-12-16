import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import LoaderComponent from '../../components/LoaderComponent';
import { logout } from '../../common/utils';

const Logout = () => {
  const { dispatch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    logout()
      .then(() => {
        setLoading(false);
        dispatch({ type: 'LOGOUT' });
        // eslint-disable-next-line no-undef
        window.location = '/login';
        return null;
      })
      .catch(() => {
        setLoading(false);
        dispatch({ type: 'LOGOUT' });
        // eslint-disable-next-line no-undef
        window.location = '/login';
        return null;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoaderComponent />;

  return null;
};

export default Logout;
