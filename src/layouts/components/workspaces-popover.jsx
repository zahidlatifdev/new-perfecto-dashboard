'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function WorkspacesPopover({ data = [], sx, ...other }) {
  const popover = usePopover();
  const { switchCompany, company } = useAuthContext();

  const mediaQuery = 'sm';

  // Use the current company from auth context as the selected workspace
  const currentWorkspace = data.find((w) => w.id === (company?._id || company?.id)) || data[0];

  const [switching, setSwitching] = useState(false);

  const handleChangeWorkspace = useCallback(
    async (newValue) => {
      if (newValue.id === currentWorkspace?.id) {
        popover.onClose();
        return;
      }

      try {
        setSwitching(true);
        popover.onClose();
        await switchCompany(newValue.id);
      } catch (error) {
        console.error('Failed to switch workspace:', error);
      } finally {
        setSwitching(false);
      }
    },
    [popover, switchCompany, currentWorkspace]
  );

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={popover.onOpen}
        disabled={switching}
        sx={{
          py: 0.5,
          gap: { xs: 0.5, [mediaQuery]: 1 },
          ...sx,
        }}
        {...other}
      >
        {switching ? (
          <CircularProgress size={24} />
        ) : (
          <Box
            component="img"
            alt={currentWorkspace?.name}
            src={currentWorkspace?.logo}
            sx={{ width: 24, height: 24, borderRadius: '50%' }}
          />
        )}

        <Box
          component="span"
          sx={{
            typography: 'subtitle2',
            display: { xs: 'none', [mediaQuery]: 'inline-flex' },
          }}
        >
          {currentWorkspace?.name}
        </Box>

        <Label
          color={currentWorkspace?.plan === 'Free' ? 'default' : 'info'}
          sx={{
            height: 22,
            display: { xs: 'none', [mediaQuery]: 'inline-flex' },
          }}
        >
          {currentWorkspace?.plan}
        </Label>

        <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
      </ButtonBase>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <MenuList sx={{ width: 240 }}>
          {data.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === currentWorkspace?.id}
              onClick={() => handleChangeWorkspace(option)}
              sx={{ height: 48 }}
            >
              <Avatar alt={option.name} src={option.logo} sx={{ width: 24, height: 24 }} />

              <Box component="span" sx={{ flexGrow: 1 }}>
                {option.name}
              </Box>

              <Label color={option.plan === 'Free' ? 'default' : 'info'}>{option.plan}</Label>
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </>
  );
}
