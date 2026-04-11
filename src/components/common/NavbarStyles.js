import styled from 'styled-components';

export const NavbarContainer = styled.nav`
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

export const NavbarInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Logo = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 22px;
  font-weight: 700;
  color: white;
  
  &:hover {
    opacity: 0.8;
  }
`;

export const NavLink = styled.a`
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #e5e7eb;
  text-decoration: none;
  border-radius: 8px;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }
`;
