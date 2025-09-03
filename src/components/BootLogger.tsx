import { useEffect } from 'react';

export const BootLogger = () => {
  useEffect(() => {
    console.log('App mounted');
  }, []);

  return null;
};
