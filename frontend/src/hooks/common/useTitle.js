import { useEffect } from 'react';

export function useTitle(title, retainOnUnmount = false) {
  useEffect(() => {
    const previousTitle = document.title;
    
    if (title) {
      document.title = title;
    }
    return () => {
      if (!retainOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, retainOnUnmount]);
}

export default useTitle;