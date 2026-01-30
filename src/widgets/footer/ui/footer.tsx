'use client';

import { Box, Typography, Link, Divider } from '@mui/material';
import { motion } from 'motion/react';

import { Container } from '@/shared/ui/container';
import { layoutColors, tradingColors } from '@/shared/config/colors';

const footerSections = [
  {
    title: '서비스',
    links: [
      { label: '거래소', href: '/trade' },
      { label: '포스트', href: '/posts' },
    ],
  },
  {
    title: '관리 및 계정',
    links: [
      { label: '포스트 등록', href: '/admin/posts/new' },
      { label: '로그인', href: '/login' },
    ],
  },
];

export const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  } as const;

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: layoutColors.dark.background,
        color: layoutColors.dark.textPrimary,
        pt: 10,
        pb: 6,
        mt: 'auto',
        borderTop: `1px solid ${layoutColors.dark.border}`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${tradingColors.rise.main}40, transparent)`,
        },
      }}
    >
      <Container>
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 6, md: 10 } }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' } }}>
            <motion.div variants={itemVariants}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  background: `linear-gradient(45deg, #fff 30%, ${tradingColors.rise.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                GARDEN BIZARRE ADVENTURE
              </Typography>
            </motion.div>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 4, md: 8 },
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            {footerSections.map((section) => (
              <Box key={section.title} sx={{ minWidth: '120px' }}>
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{
                      color: '#fff',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 2.5,
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {section.links.map((link) => (
                      <Box key={link.label} sx={{ position: 'relative', width: 'fit-content' }}>
                        <Link
                          component={Link}
                          href={link.href}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            transition: 'color 0.2s',
                            display: 'block',
                            position: 'relative',
                            '&:hover': {
                              color: tradingColors.rise.main,
                              '&::after': {
                                transform: 'scaleX(1)',
                              },
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: -4,
                              left: 0,
                              width: '100%',
                              height: '2px',
                              backgroundColor: tradingColors.rise.main,
                              transform: 'scaleX(0)',
                              transformOrigin: 'center',
                              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            },
                          }}
                        >
                          {link.label}
                        </Link>
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 8, borderColor: layoutColors.dark.border }} />

        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 400 }}>
            © {new Date().getFullYear()} Garden Bizarre Adventure. 제작위원회.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
