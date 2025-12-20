'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CompanySelector() {
    const router = useRouter();
    const popover = useBoolean();
    const { user, companies, selectedCompany, checkUserSession, switchCompany } = useAuthContext();

    const [isLoading, setIsLoading] = useState(false);

    const handleCompanySwitch = useCallback(async (company) => {
        if (company._id === selectedCompany?._id) {
            popover.onFalse();
            return;
        }

        try {
            setIsLoading(true);
            await switchCompany(company._id);
            popover.onFalse();

            // Refresh the page to update the context
            window.location.reload();
        } catch (error) {
            console.error('Failed to switch company:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompany, checkUserSession, popover]);

    const handleManageCompanies = useCallback(() => {
        popover.onFalse();
        router.push('/dashboard/settings?tab=companies');
    }, [router, popover]);

    if (!companies || companies.length === 0) {
        return (
            <Button
                onClick={() => router.push('/dashboard/settings?tab=companies')}
                variant="outlined"
                startIcon={<Iconify icon="solar:buildings-3-bold-duotone" width={20} />}
                sx={{
                    color: 'text.primary',
                    borderColor: 'divider',
                    minWidth: 200,
                    justifyContent: 'flex-start',
                    pl: 1.5,
                    pr: 1,
                }}
            >
                <Box sx={{ flexGrow: 1, textAlign: 'left', ml: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                        Create Company
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Get started
                    </Typography>
                </Box>
            </Button>
        );
    } return (
        <>
            <Button
                onClick={popover.onTrue}
                variant="outlined"
                startIcon={
                    <Avatar
                        src={selectedCompany?.logo}
                        alt={selectedCompany?.name}
                        sx={{
                            width: 24,
                            height: 24,
                            bgcolor: selectedCompany?.logo ? 'transparent' : 'primary.main'
                        }}
                    >
                        {!selectedCompany?.logo && selectedCompany?.name?.charAt(0)}
                    </Avatar>
                }
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
                sx={{
                    color: 'text.primary',
                    borderColor: 'divider',
                    minWidth: 200,
                    justifyContent: 'flex-start',
                    pl: 1.5,
                    pr: 1,
                }}
            >
                <Box sx={{ flexGrow: 1, textAlign: 'left', ml: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                        {selectedCompany?.name || 'Select Company'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user?.role || 'Member'}
                    </Typography>
                </Box>
            </Button>

            <Popover
                open={popover.value}
                anchorEl={popover.anchorEl}
                onClose={popover.onFalse}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        sx: { width: 280, p: 0 },
                    },
                }}
            >
                <Box sx={{ p: 2, pb: 1.5 }}>
                    <Typography variant="subtitle1">Switch Company</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Select a company to work with
                    </Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <MenuList disablePadding sx={{ p: 1 }}>
                    {companies.map((company) => {
                        const userInCompany = company.users?.find(u => u.userId === user?._id);
                        const isSelected = company._id === selectedCompany?._id;

                        return (
                            <MenuItem
                                key={company._id}
                                onClick={() => handleCompanySwitch(company)}
                                disabled={isLoading}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    borderRadius: 1,
                                    ...(isSelected && {
                                        bgcolor: 'action.selected',
                                    }),
                                }}
                            >
                                <ListItemIcon>
                                    <Avatar
                                        src={company.logo}
                                        alt={company.name}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: company.logo ? 'transparent' : 'primary.main'
                                        }}
                                    >
                                        {!company.logo && company.name?.charAt(0)}
                                    </Avatar>
                                </ListItemIcon>

                                <ListItemText
                                    primary={company.name}
                                    secondary={userInCompany?.role || 'Member'}
                                    primaryTypographyProps={{
                                        variant: 'subtitle2',
                                        noWrap: true,
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'caption',
                                        color: 'text.secondary',
                                    }}
                                />

                                {isSelected && (
                                    <Iconify icon="eva:checkmark-fill" width={16} color="primary.main" />
                                )}
                            </MenuItem>
                        );
                    })}
                </MenuList>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box sx={{ p: 1 }}>
                    <MenuItem
                        onClick={handleManageCompanies}
                        disabled={isLoading}
                        sx={{
                            py: 1,
                            px: 2,
                            borderRadius: 1,
                            color: 'text.secondary',
                        }}
                    >
                        <ListItemIcon>
                            <Iconify icon="eva:settings-2-fill" width={20} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Manage Companies"
                            primaryTypographyProps={{
                                variant: 'subtitle2',
                            }}
                        />
                    </MenuItem>
                </Box>

                {isLoading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                        }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                )}
            </Popover>
        </>
    );
}
