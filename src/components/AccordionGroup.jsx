import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AccordionGroupContext = createContext(null);

export function AccordionGroup({ defaultOpenId = null, children }) {
  const [openId, setOpenId] = useState(defaultOpenId);

  const toggle = useCallback((id) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  const value = useMemo(
    () => ({
      openId,
      toggle,
      isOpen: (id) => openId === id,
    }),
    [openId, toggle]
  );

  return <AccordionGroupContext.Provider value={value}>{children}</AccordionGroupContext.Provider>;
}

export function useAccordionGroup() {
  return useContext(AccordionGroupContext);
}
