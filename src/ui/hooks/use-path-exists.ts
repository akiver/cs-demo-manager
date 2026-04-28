import { useEffect, useState } from 'react';

export function usePathExists(filePath: string) {
  const [pathExists, setPathExists] = useState(false);

  useEffect(() => {
    const checkIfPathExists = async () => {
      const exists = await window.csdm.pathExists(filePath);
      setPathExists(exists);
    };

    void checkIfPathExists();
  }, [filePath]);

  return pathExists;
}
