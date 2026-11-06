"use client";

import Image from "next/image";
import { Box, IconButton, Typography } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

type AppHeaderProps = {
  userName: string;
  area: string;
  role: string;
  onOpenNav: () => void;
};

export function AppHeader({ userName, area, role, onOpenNav }: AppHeaderProps) {
  return (
    <Box component="header" className="app-header">
      <Box className="app-header__brand">
        <Image
          src="/images/logo.png"
          alt="SGTA"
          width={260}
          height={87}
          priority
          className="app-header__logo"
        />
      </Box>

      <Box className="app-header__user">
        <Box className="app-header__profile">
          <Typography component="p" className="app-header__role">
            {role || "Usuario"}
          </Typography>
          <Typography component="p" className="app-header__name">
            {userName}
          </Typography>
        </Box>
        <Box className="app-header__area-badge">
          <Typography component="span" className="app-header__area">
            {area}
          </Typography>
        </Box>
      </Box>

      <IconButton
        className="app-header__menu"
        aria-label="Abrir menú de navegación"
        onClick={onOpenNav}
      >
        <MenuRoundedIcon />
      </IconButton>
    </Box>
  );
}
