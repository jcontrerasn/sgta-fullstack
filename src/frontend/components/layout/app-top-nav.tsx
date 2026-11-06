"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

type AppTopNavProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

function getCurrentDate() {
  const date = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return date.charAt(0).toLocaleUpperCase("es-PE") + date.slice(1);
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function CurrentTime() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => setCurrentTime(getCurrentTime());
    const now = new Date();
    const millisecondsUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let intervalId: number | undefined;

    updateTime();
    const timeoutId = window.setTimeout(() => {
      updateTime();
      intervalId = window.setInterval(updateTime, 60_000);
    }, millisecondsUntilNextMinute);

    return () => {
      window.clearTimeout(timeoutId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return <Box className="app-top-nav__time">{currentTime}</Box>;
}

function NavigationItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <List disablePadding className="app-top-nav__links">
      <Box className="app-top-nav__item-wrapper">
        <ListItemButton
          component={Link}
          href="/"
          onClick={onNavigate}
          className="app-top-nav__item app-top-nav__item--active"
        >
          <ListItemText primary="Inicio" />
        </ListItemButton>
      </Box>
    </List>
  );
}

function NavigationTools({
  darkMode,
  onToggleDarkMode,
}: Pick<AppTopNavProps, "darkMode" | "onToggleDarkMode">) {
  return (
    <Box className="app-top-nav__tools">
      <Box className="app-top-nav__clock">
        <CurrentTime />
        <Box className="app-top-nav__date">{getCurrentDate()}</Box>
      </Box>
      <IconButton
        className="app-top-nav__theme-toggle"
        aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
        onClick={onToggleDarkMode}
      >
        {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Box>
  );
}

export function AppTopNav({
  mobileOpen,
  onMobileClose,
  darkMode,
  onToggleDarkMode,
}: AppTopNavProps) {
  return (
    <>
      <Box component="nav" className="app-top-nav" aria-label="Navegación principal">
        <Box className="app-top-nav__desktop">
          <NavigationItems />
          <NavigationTools
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        </Box>
      </Box>

      {mobileOpen ? (
        <Box
          component="nav"
          className="app-top-nav-mobile"
          aria-label="Navegación móvil"
        >
          <Box className="app-top-nav-mobile__heading">
            <Box component="span">Menú principal</Box>
            <IconButton
              aria-label="Cerrar menú de navegación"
              onClick={onMobileClose}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <NavigationItems onNavigate={onMobileClose} />
          <NavigationTools
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        </Box>
      ) : null}
    </>
  );
}
