import React from 'react';
import PinList from '../components/PinList';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
// import Container from '@mui/material/Container';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import Box from '@mui/material/Box';
// import AddIcon from '@mui/icons-material/Add';


const Home = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">            
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">
                    Pinch Feed
                </h1>
                <Button asChild>
                    <RouterLink to="/pins/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Pin
                    </RouterLink>
                </Button>
            </div>
            
            <PinList />
        </div>
    );
    
    //old mui way
    // return (
    //     <Container maxWidth="xl" sx={{ py: 3 }}> {/* Use Container for padding and max width */}
    //         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    //             <Typography variant="h4" component="h1" gutterBottom>
    //                 Pinch Feed
    //             </Typography>
    //             <Button
    //                 variant="contained"
    //                 component={RouterLink} // Use RouterLink for navigation
    //                 to="/pins/new"
    //                 startIcon={<AddIcon />} // Optional icon
    //             >
    //                 Create Pin
    //             </Button>
    //         </Box>
    //         <PinList />
    //     </Container>
    // );
};

export default Home;