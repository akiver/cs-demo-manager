import React from 'react';
import { GrenadesTabs } from './grenades-tabs';
import { Outlet } from 'react-router-dom';

export function MatchGrenades() {
  return (
    <>
      <GrenadesTabs />
      <Outlet />
    </>
  );
}
