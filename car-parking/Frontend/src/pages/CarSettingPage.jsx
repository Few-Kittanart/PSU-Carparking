import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Button, 
    Grid, 
    TextField, 
    Paper, 
    List, 
    ListItem, 
    ListItemText, 
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
    Box,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Tabs,
    Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { HexColorPicker } from 'react-colorful';

const apiCall = async (method, path, body) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/car-settings${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : null
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `API call failed on ${path}`);
    }
    return data;
};

function BrandManager({ settings, setSettings, setAlert }) {
    const [newBrandName, setNewBrandName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddBrand = async () => {
        if (!newBrandName.trim()) return;
        setLoading(true);
        try {
            const newBrand = await apiCall('POST', '/brands', { name: newBrandName });
            setSettings(prev => ({ ...prev, brands: [...prev.brands, newBrand] }));
            setNewBrandName('');
            setAlert({ open: true, message: 'เพิ่มยี่ห้อสำเร็จ!', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBrand = async (brandId) => {
        if (!window.confirm('ยืนยันลบยี่ห้อ? รุ่นรถที่เชื่อมโยงจะถูกลบไปด้วย')) return;
        setLoading(true);
        try {
            await apiCall('DELETE', `/brands/${brandId}`);
            setSettings(prev => ({
                ...prev,
                brands: prev.brands.filter(b => b._id !== brandId),
                models: prev.models.filter(m => m.brandId !== brandId)
            }));
            setAlert({ open: true, message: 'ลบยี่ห้อและรุ่นที่เกี่ยวข้องสำเร็จ!', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>จัดการยี่ห้อรถ ({settings.brands.length} รายการ)</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                    label="ชื่อยี่ห้อใหม่"
                    variant="outlined"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    fullWidth
                    disabled={loading}
                />
                <Button 
                    variant="contained" 
                    onClick={handleAddBrand} 
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    disabled={loading || !newBrandName.trim()}
                    sx={{ backgroundColor: '#ea7f33', '&:hover': { backgroundColor: '#e06d1f' } }}
                >
                    เพิ่ม
                </Button>
            </Box>
            <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                {settings.brands.map((brand) => (
                    <ListItem 
                        key={brand._id}
                        divider
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteBrand(brand._id)} disabled={loading}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText primary={brand.name} secondary={`ID: ${brand._id}`} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}

function ModelManager({ settings, setSettings, setAlert }) {
    const [newModelName, setNewModelName] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddModel = async () => {
        if (!newModelName.trim() || !selectedBrandId) return;
        setLoading(true);
        try {
            const newModel = await apiCall('POST', '/models', { 
                name: newModelName, 
                brandId: selectedBrandId 
            });
            setSettings(prev => ({ ...prev, models: [...prev.models, newModel] }));
            setNewModelName('');
            setSelectedBrandId('');
            setAlert({ open: true, message: 'เพิ่มรุ่นรถสำเร็จ!', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteModel = async (modelId) => {
        if (!window.confirm('ยืนยันลบรุ่นรถนี้?')) return;
        setLoading(true);
        try {
            await apiCall('DELETE', `/models/${modelId}`);
            setSettings(prev => ({ 
                ...prev, 
                models: prev.models.filter(m => m._id !== modelId) 
            }));
            setAlert({ open: true, message: 'ลบรุ่นรถสำเร็จ!', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const modelsByBrand = settings.models.reduce((acc, model) => {
        const brand = settings.brands.find(b => b._id === model.brandId);
        const brandName = brand ? brand.name : 'ไม่พบยี่ห้อ';
        if (!acc[brandName]) acc[brandName] = [];
        acc[brandName].push(model);
        return acc;
    }, {});


    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>จัดการรุ่นรถ ({settings.models.length} รายการ)</Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                    <FormControl fullWidth size="medium" disabled={loading}>
                        <InputLabel>เลือกยี่ห้อ</InputLabel>
                        <Select
                            value={selectedBrandId}
                            label="เลือกยี่ห้อ"
                            onChange={(e) => setSelectedBrandId(e.target.value)}
                        >
                            {settings.brands.map((brand) => (
                                <MenuItem key={brand._id} value={brand._id}>
                                    {brand.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                    <TextField
                        label="ชื่อรุ่นใหม่"
                        variant="outlined"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        fullWidth
                        disabled={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <Button 
                        variant="contained" 
                        onClick={handleAddModel} 
                        disabled={loading || !newModelName.trim() || !selectedBrandId}
                        fullWidth
                        sx={{ backgroundColor: '#ea7f33', '&:hover': { backgroundColor: '#e06d1f' }, height: '100%' }}
                    >
                        <AddIcon />
                    </Button>
                </Grid>
            </Grid>

            <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                {Object.keys(modelsByBrand).map(brandName => (
                    <Box key={brandName} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="subtitle1" sx={{ p: 1, backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                            {brandName}
                        </Typography>
                        <List dense>
                            {modelsByBrand[brandName].map((model) => (
                                <ListItem 
                                    key={model._id}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteModel(model._id)} disabled={loading}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={model.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}

function TypeManager({ settings, setSettings, setAlert }) {
    const [newTypeName, setNewTypeName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddType = async () => {
        if (!newTypeName.trim()) return;
        setLoading(true);
        try {
            const newType = await apiCall('POST', '/types', { name: newTypeName });
            setSettings(prev => ({ ...prev, types: [...prev.types, newType] }));
            setNewTypeName('');
            setAlert({ open: true, message: 'เพิ่มประเภทรถสำเร็จ!', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteType = async (typeId) => {
        if (!window.confirm('ยืนยันลบประเภทรถนี้?')) return;
        setLoading(true);
        try {
            await apiCall('DELETE', `/types/${typeId}`);
            setSettings(prev => ({ 
                ...prev, 
                types: prev.types.filter(t => t._id !== typeId) 
            }));
            setAlert({ open: true, message: 'ลบประเภทรถสำเร็จ!', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>จัดการประเภทรถ ({settings.types.length} รายการ)</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                    label="ชื่อประเภทใหม่"
                    variant="outlined"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    fullWidth
                    disabled={loading}
                />
                <Button 
                    variant="contained" 
                    onClick={handleAddType} 
                    disabled={loading || !newTypeName.trim()}
                    sx={{ backgroundColor: '#ea7f33', '&:hover': { backgroundColor: '#e06d1f' } }}
                >
                    <AddIcon />
                </Button>
            </Box>
            <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                {settings.types.map((type) => (
                    <ListItem 
                        key={type._id}
                        divider
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteType(type._id)} disabled={loading}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText primary={type.name} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}

function ColorManager({ settings, setSettings, setAlert }) {
    const [newColorName, setNewColorName] = useState('');
    const [newColorHex, setNewColorHex] = useState('#FFFFFF');
    const [loading, setLoading] = useState(false);

    const handleAddColor = async () => {
        if (!newColorName.trim()) return;
        setLoading(true);
        try {
            const newColor = await apiCall('POST', '/colors', { 
                name: newColorName, 
                hex_code: newColorHex 
            });
            setSettings(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
            setNewColorName('');
            setAlert({ open: true, message: 'เพิ่มสีสำเร็จ!', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteColor = async (colorId) => {
        if (!window.confirm('ยืนยันลบสีนี้?')) return;
        setLoading(true);
        try {
            await apiCall('DELETE', `/colors/${colorId}`);
            setSettings(prev => ({ 
                ...prev, 
                colors: prev.colors.filter(c => c._id !== colorId) 
            }));
            setAlert({ open: true, message: 'ลบสีสำเร็จ!', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>จัดการสีรถ ({settings.colors.length} รายการ)</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="ชื่อสีใหม่ (เช่น แดง)"
                        variant="outlined"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        fullWidth
                        disabled={loading}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        label="รหัสสี (Hex)"
                        variant="outlined"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        fullWidth
                        disabled={loading}
                        sx={{ mb: 1 }}
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ width: 20, height: 20, mr: 1, backgroundColor: newColorHex, border: '1px solid #00000033', borderRadius: '4px' }} />
                            )
                        }}
                    />
                     <Button 
                        variant="contained" 
                        onClick={handleAddColor} 
                        disabled={loading || !newColorName.trim()}
                        fullWidth
                        sx={{ backgroundColor: '#ea7f33', '&:hover': { backgroundColor: '#e06d1f' } }}
                    >
                        <AddIcon />
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                         {/* Color Picker Component */}
                        <HexColorPicker color={newColorHex} onChange={setNewColorHex} />
                    </Box>
                </Grid>
            </Grid>

            <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                {settings.colors.map((color) => (
                    <ListItem 
                        key={color._id}
                        divider
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteColor(color._id)} disabled={loading}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <Box sx={{ width: 20, height: 20, mr: 2, backgroundColor: color.hex_code || '#CCCCCC', border: '1px solid #00000033', borderRadius: '4px' }} />
                        <ListItemText primary={color.name} secondary={color.hex_code} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}

export default function CarSettingPage() {
    const [settings, setSettings] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await apiCall('GET', '');
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setAlert({ open: true, message: `Error: ${error.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading || !settings) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#ea7f33', fontWeight: 'bold' }}>
                ⚙️ หน้าจัดการข้อมูลหลักรถยนต์ (Master Data)
            </Typography>
            
            <Paper elevation={2} sx={{ mb: 4 }}>
                 <Tabs value={tabValue} onChange={handleTabChange} aria-label="car settings tabs" centered>
                    <Tab label="ยี่ห้อรถ" />
                    <Tab label="รุ่นรถ" />
                    <Tab label="ประเภทรถ" />
                    <Tab label="สีรถ" />
                </Tabs>
            </Paper>

            <Box sx={{ p: 0 }}>
                {tabValue === 0 && <BrandManager settings={settings} setSettings={setSettings} setAlert={setAlert} />}
                {tabValue === 1 && <ModelManager settings={settings} setSettings={setSettings} setAlert={setAlert} />}
                {tabValue === 2 && <TypeManager settings={settings} setSettings={setSettings} setAlert={setAlert} />}
                {tabValue === 3 && <ColorManager settings={settings} setSettings={setSettings} setAlert={setAlert} />}
            </Box>

            <Snackbar open={alert.open} autoHideDuration={6000} onClose={() => setAlert(prev => ({ ...prev, open: false }))}>
                <Alert onClose={() => setAlert(prev => ({ ...prev, open: false }))} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}