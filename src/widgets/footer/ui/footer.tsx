'use client';

import { Box, Typography, Link, Divider, useTheme } from '@mui/material';

import { Container } from '@/shared/ui/container';

const footerSections = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Web Development', href: '/services/web' },
      { label: 'Mobile Apps', href: '/services/mobile' },
      { label: 'Consulting', href: '/services/consulting' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Support', href: '/support' },
    ],
  },
];

export const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.grey[100],
        py: 6,
        mt: 'auto',
      }}
    >
      <Container>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Garden Bizarre Adventure
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Building amazing web experiences with modern technologies. Creating digital solutions that make a difference.
            </Typography>
          </Box>

          {footerSections.map((section) => (
            <Box key={section.title} sx={{ flex: { xs: '1 1 50%', sm: '1 1 33%', md: '1 1 16%' } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {section.links.map((link) => (
                  <Link key={link.label} href={link.href} color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Garden Bizarre Adventure. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="/privacy" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
