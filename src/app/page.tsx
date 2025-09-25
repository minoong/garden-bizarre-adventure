import { Container, Typography, Button, Box, Stack } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Material-UI + Next.js v15
        </Typography>

        <Typography variant="h6" color="text.secondary" paragraph align="center">
          Material-UI is successfully configured with Next.js App Router
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="contained" size="large">
            Primary Button
          </Button>
          <Button variant="outlined" size="large">
            Secondary Button
          </Button>
        </Stack>

        <Typography variant="body1" sx={{ mt: 4 }} align="center">
          Edit <code>src/app/page.tsx</code> and save to see your changes.
        </Typography>
      </Box>
    </Container>
  );
}
