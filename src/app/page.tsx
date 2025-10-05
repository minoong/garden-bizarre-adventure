import { Typography, Button, Box, Stack } from '@mui/material';

import { Container } from '@/shared/ui/container';
import { LayoutProvider } from '@/app/providers';
import { HomeHero } from '@/widgets/home-hero/ui';

export default function Home() {
  return (
    <LayoutProvider>
      <Container>
        <HomeHero />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',

            textAlign: 'center',
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
            }}
          >
            Welcome to Garden Bizarre Adventure
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: '600px',
              fontSize: { xs: '1rem', md: '1.25rem' },
              mb: 2,
            }}
          >
            Experience the future of web development with Material-UI v7, Next.js v15, and modern architecture patterns.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
            <Button variant="contained" size="large" sx={{ minWidth: { xs: '200px', sm: 'auto' } }}>
              로그인
            </Button>
            <Button variant="outlined" size="large" sx={{ minWidth: { xs: '200px', sm: 'auto' } }}>
              요동친다!!! 비트!
            </Button>
          </Stack>

          <Typography variant="body1" sx={{ mt: 6 }} color="text.secondary">
            Built with FSD architecture • Responsive design • TypeScript ready
          </Typography>
        </Box>
      </Container>
    </LayoutProvider>
  );
}
