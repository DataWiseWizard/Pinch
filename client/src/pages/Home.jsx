import React from 'react';
import PinList from '../components/PinList';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';

const Home = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 3 }}> {/* Use Container for padding and max width */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Pinch Feed
                </Typography>
                <Button
                    variant="contained"
                    component={RouterLink} // Use RouterLink for navigation
                    to="/pins/new"
                    startIcon={<AddIcon />} // Optional icon
                >
                    Create Pin
                </Button>
            </Box>
            <PinList />
        </Container>
    );
};

export default Home;