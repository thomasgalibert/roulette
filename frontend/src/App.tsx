import { createSignal, onMount, For, Show } from 'solid-js';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Paper,
  Button,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Chip,
  Box,
  Stack,
  CircularProgress,
  Divider
} from '@suid/material';
import AddIcon from '@suid/icons-material/Add';
import DeleteIcon from '@suid/icons-material/Delete';
import EditIcon from '@suid/icons-material/Edit';
import CasinoIcon from '@suid/icons-material/Casino';
import CheckCircleIcon from '@suid/icons-material/CheckCircle';
import CancelIcon from '@suid/icons-material/Cancel';
import GroupsIcon from '@suid/icons-material/Groups';
import TrophyIcon from '@suid/icons-material/EmojiEvents';
import RestartAltIcon from '@suid/icons-material/RestartAlt';
import RefreshIcon from '@suid/icons-material/Refresh';
import { api } from './services/api';
import type { Person, Winner } from './types/index';
import RouletteWheel from './components/RouletteWheel';
import './App.css';

function App() {
  const [persons, setPersons] = createSignal<Person[]>([]);
  const [winners, setWinners] = createSignal<Winner[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = createSignal(false);
  const [editDialogOpen, setEditDialogOpen] = createSignal(false);
  const [rouletteDialogOpen, setRouletteDialogOpen] = createSignal(false);
  const [historyDialogOpen, setHistoryDialogOpen] = createSignal(false);
  
  // Form states
  const [newPersonName, setNewPersonName] = createSignal('');
  const [editingPerson, setEditingPerson] = createSignal<Person | null>(null);
  const [editName, setEditName] = createSignal('');
  
  // Roulette state
  const [spinResult, setSpinResult] = createSignal<Person | null>(null);
  const [isSpinning, setIsSpinning] = createSignal(false);

  onMount(async () => {
    await loadPersons();
  });

  const loadPersons = async () => {
    try {
      setLoading(true);
      const data = await api.getPersons();
      setPersons(data);
    } catch (err) {
      setError('Erreur lors du chargement des personnes');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.getWinHistory();
      setWinners(data);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
    }
  };

  const handleAddPerson = async () => {
    if (!newPersonName().trim()) return;
    
    try {
      const newPerson = await api.createPerson(newPersonName());
      // Add the new person to the list without reloading
      setPersons(prev => [...prev, newPerson]);
      setNewPersonName('');
      setAddDialogOpen(false);
      setSuccess('Personne ajoutée avec succès');
    } catch (err) {
      setError('Erreur lors de l\'ajout de la personne');
    }
  };

  const handleEditPerson = async () => {
    const person = editingPerson();
    if (!person || !editName().trim()) return;
    
    try {
      const updatedPerson = await api.updatePerson(person.id, { name: editName() });
      // Update only the specific person in the list
      setPersons(prev => prev.map(p => 
        p.id === person.id ? updatedPerson : p
      ));
      setEditDialogOpen(false);
      setEditingPerson(null);
      setSuccess('Personne modifiée avec succès');
    } catch (err) {
      setError('Erreur lors de la modification');
    }
  };

  const handleDeletePerson = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) return;
    
    try {
      await api.deletePerson(id);
      // Remove the person from the list without reloading
      setPersons(prev => prev.filter(p => p.id !== id));
      setSuccess('Personne supprimée avec succès');
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleTogglePresence = async (person: Person) => {
    try {
      const updatedPerson = await api.updatePresence(person.id, !person.present);
      // Update only the specific person in the list without reloading everything
      setPersons(prev => prev.map(p => 
        p.id === person.id ? updatedPerson : p
      ));
    } catch (err) {
      setError('Erreur lors de la mise à jour de la présence');
    }
  };

  const handleToggleAllPresence = async (present: boolean) => {
    try {
      await api.toggleAllPresence(present);
      await loadPersons();
    } catch (err) {
      setError('Erreur lors de la mise à jour des présences');
    }
  };

  const handleSpinRoulette = async () => {
    try {
      setIsSpinning(true);
      setSpinResult(null);
      
      // Simulate spinning animation delay
      setTimeout(async () => {
        try {
          const result = await api.spinRoulette();
          setSpinResult(result.winner);
          setIsSpinning(false);
          await loadPersons();
        } catch (err: any) {
          setIsSpinning(false);
          setError(err.message || 'Erreur lors du tirage');
        }
      }, 5000); // Increased to 5 seconds
    } catch (err) {
      setIsSpinning(false);
      setError('Erreur lors du tirage');
    }
  };

  const handleResetWins = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes les victoires ?')) return;
    
    try {
      await api.resetWinCounts();
      setSuccess('Les compteurs de victoires ont été réinitialisés');
      await loadPersons();
    } catch (err) {
      setError('Erreur lors de la réinitialisation');
    }
  };

  const handleResetPersonWins = async (person: Person) => {
    if (!confirm(`Êtes-vous sûr de vouloir réinitialiser les victoires de ${person.name} ?`)) return;
    
    try {
      const updatedPerson = await api.resetPersonWins(person.id);
      setPersons(prev => prev.map(p => 
        p.id === person.id ? updatedPerson : p
      ));
      setSuccess(`Les victoires de ${person.name} ont été réinitialisées`);
    } catch (err) {
      setError('Erreur lors de la réinitialisation');
    }
  };

  const presentCount = () => persons().filter(p => p.present).length;

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#d32f2f' }}>
        <Toolbar>
          <CasinoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Roulette BNI
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<RestartAltIcon />}
            onClick={handleResetWins}
            sx={{ mr: 2 }}
          >
            Reset victoires
          </Button>
          <Button 
            color="inherit" 
            startIcon={<TrophyIcon />}
            onClick={() => {
              loadHistory();
              setHistoryDialogOpen(true);
            }}
          >
            Historique
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={3}>
          {/* Statistics */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">
                  <GroupsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Membres présents
                </Typography>
                <Typography variant="h3" color="primary">
                  {presentCount()} / {persons().length}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleToggleAllPresence(true)}
                >
                  Tous présents
                </Button>
                <Button 
                  variant="contained" 
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleToggleAllPresence(false)}
                >
                  Tous absents
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Members list */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Membres</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Ajouter
              </Button>
            </Stack>

            <Show when={loading()} fallback={
              <List>
                <For each={persons()}>
                  {(person) => (
                    <ListItem divider>
                      <ListItemText 
                        primary={person.name}
                        secondary={
                          <Stack direction="row" spacing={1} mt={1}>
                            <Chip 
                              label={person.present ? 'Présent' : 'Absent'}
                              color={person.present ? 'success' : 'default'}
                              size="small"
                            />
                            {person.win_count > 0 && (
                              <Chip 
                                label={`${person.win_count} victoire${person.win_count > 1 ? 's' : ''}`}
                                color="primary"
                                size="small"
                              />
                            )}
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Switch 
                            checked={person.present}
                            onChange={() => handleTogglePresence(person)}
                            color="primary"
                          />
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setEditingPerson(person);
                              setEditName(person.name);
                              setEditDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          {person.win_count > 0 && (
                            <IconButton 
                              size="small"
                              color="warning"
                              title="Réinitialiser les victoires"
                              onClick={() => handleResetPersonWins(person)}
                            >
                              <RefreshIcon />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => handleDeletePerson(person.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </For>
              </List>
            }>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            </Show>
          </Paper>
        </Stack>

        {/* Floating action button */}
        <Fab 
          color="primary" 
          size="large"
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32,
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' }
          }}
          onClick={() => setRouletteDialogOpen(true)}
          disabled={presentCount() === 0}
        >
          <CasinoIcon />
        </Fab>
      </Container>

      {/* Add person dialog */}
      <Dialog open={addDialogOpen()} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Ajouter un membre</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            fullWidth
            variant="outlined"
            value={newPersonName()}
            onChange={(e, value) => setNewPersonName(value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleAddPerson} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Edit person dialog */}
      <Dialog open={editDialogOpen()} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Modifier le membre</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            fullWidth
            variant="outlined"
            value={editName()}
            onChange={(e, value) => setEditName(value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEditPerson()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleEditPerson} variant="contained">Modifier</Button>
        </DialogActions>
      </Dialog>

      {/* Roulette dialog */}
      <Dialog 
        open={rouletteDialogOpen()} 
        onClose={() => !isSpinning() && setRouletteDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h4" textAlign="center">
            Roulette BNI
          </Typography>
        </DialogTitle>
        <DialogContent>
          <RouletteWheel 
            persons={persons().filter(p => p.present)}
            isSpinning={isSpinning()}
            winner={spinResult()}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setRouletteDialogOpen(false);
              setSpinResult(null);
              setIsSpinning(false); // Ensure spinning is stopped
            }}
            disabled={isSpinning()}
          >
            Fermer
          </Button>
          <Button 
            onClick={handleSpinRoulette}
            variant="contained"
            disabled={isSpinning()}
            sx={{ 
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#b71c1c' }
            }}
          >
            {isSpinning() ? 'Tirage en cours...' : 'Lancer la roulette'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History dialog */}
      <Dialog 
        open={historyDialogOpen()} 
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Historique des tirages</DialogTitle>
        <DialogContent>
          <List>
            <For each={winners()}>
              {(winner) => (
                <>
                  <ListItem>
                    <ListItemText
                      primary={winner.person.name}
                      secondary={new Date(winner.won_at).toLocaleString('fr-FR')}
                    />
                  </ListItem>
                  <Divider />
                </>
              )}
            </For>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Show when={error()}>
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            left: 20, 
            p: 2, 
            bgcolor: '#f44336',
            color: 'white',
            zIndex: 1000
          }}
        >
          <Typography>{error()}</Typography>
          <Button 
            size="small" 
            sx={{ color: 'white', mt: 1 }} 
            onClick={() => setError('')}
          >
            Fermer
          </Button>
        </Paper>
      </Show>

      <Show when={success()}>
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            left: 20, 
            p: 2, 
            bgcolor: '#4caf50',
            color: 'white',
            zIndex: 1000
          }}
        >
          <Typography>{success()}</Typography>
          <Button 
            size="small" 
            sx={{ color: 'white', mt: 1 }} 
            onClick={() => setSuccess('')}
          >
            Fermer
          </Button>
        </Paper>
      </Show>
    </>
  );
}

export default App;