import { createSignal, onMount, For, Show, createEffect } from 'solid-js';
import { 
  Plus,
  Trash2,
  Edit3,
  Dices,
  CheckCircle,
  XCircle,
  Users,
  Trophy,
  RotateCcw,
  RefreshCcw,
  Moon,
  Sun
} from 'lucide-solid';
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
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light');
  
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

  // Theme effect
  createEffect(() => {
    document.documentElement.setAttribute('data-theme', theme());
  });

  onMount(async () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    
    await loadPersons();
  });

  const toggleTheme = () => {
    const newTheme = theme() === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

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
      setPersons(prev => [...prev, newPerson]);
      setNewPersonName('');
      setAddDialogOpen(false);
      setSuccess('Personne ajoutée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la personne');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditPerson = async () => {
    const person = editingPerson();
    if (!person || !editName().trim()) return;
    
    try {
      const updatedPerson = await api.updatePerson(person.id, { name: editName() });
      setPersons(prev => prev.map(p => 
        p.id === person.id ? updatedPerson : p
      ));
      setEditDialogOpen(false);
      setEditingPerson(null);
      setSuccess('Personne modifiée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la modification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeletePerson = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) return;
    
    try {
      await api.deletePerson(id);
      setPersons(prev => prev.filter(p => p.id !== id));
      setSuccess('Personne supprimée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTogglePresence = async (person: Person) => {
    try {
      const updatedPerson = await api.updatePresence(person.id, !person.present);
      setPersons(prev => prev.map(p => 
        p.id === person.id ? updatedPerson : p
      ));
    } catch (err) {
      setError('Erreur lors de la mise à jour de la présence');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleAllPresence = async (present: boolean) => {
    try {
      await api.toggleAllPresence(present);
      await loadPersons();
    } catch (err) {
      setError('Erreur lors de la mise à jour des présences');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSpinRoulette = async () => {
    try {
      setIsSpinning(true);
      setSpinResult(null);
      
      setTimeout(async () => {
        try {
          const result = await api.spinRoulette();
          setSpinResult(result.winner);
          setIsSpinning(false);
          await loadPersons();
        } catch (err: any) {
          setIsSpinning(false);
          setError(err.message || 'Erreur lors du tirage');
          setTimeout(() => setError(''), 3000);
        }
      }, 5000);
    } catch (err) {
      setIsSpinning(false);
      setError('Erreur lors du tirage');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResetWins = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes les victoires ?')) return;
    
    try {
      await api.resetWinCounts();
      setSuccess('Les compteurs de victoires ont été réinitialisés');
      setTimeout(() => setSuccess(''), 3000);
      await loadPersons();
    } catch (err) {
      setError('Erreur lors de la réinitialisation');
      setTimeout(() => setError(''), 3000);
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la réinitialisation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const presentCount = () => persons().filter(p => p.present).length;

  return (
    <div class="app">
      {/* App Bar */}
      <header class="md-app-bar elevation-1">
        <Dices size={24} />
        <h1 class="md-app-bar-title">Roulette BNI</h1>
        <button 
          class="md-icon-button"
          onClick={handleResetWins}
          title="Réinitialiser toutes les victoires"
        >
          <RotateCcw size={20} />
        </button>
        <button 
          class="md-icon-button"
          onClick={() => {
            loadHistory();
            setHistoryDialogOpen(true);
          }}
          title="Historique"
        >
          <Trophy size={20} />
        </button>
        <button 
          class="md-icon-button"
          onClick={toggleTheme}
          title="Changer le thème"
        >
          {theme() === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      <main class="md-container" style={{ "padding-top": "24px", "padding-bottom": "100px" }}>
        {/* Statistics Card */}
        <div class="md-card md-card-filled" style={{ "margin-bottom": "24px" }}>
          <div class="md-card-content">
            <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between", "flex-wrap": "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", "align-items": "center", gap: "12px", "margin-bottom": "8px" }}>
                  <Users size={24} />
                  <h2 class="headline-small">Membres présents</h2>
                </div>
                <p class="display-small" style={{ color: "var(--md-sys-color-primary)" }}>
                  {presentCount()} / {persons().length}
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", "flex-wrap": "wrap" }}>
                <button 
                  class="md-button md-button-filled md-ripple"
                  onClick={() => handleToggleAllPresence(true)}
                  style={{ "background-color": "var(--md-sys-color-tertiary)", color: "var(--md-sys-color-on-tertiary)" }}
                >
                  <CheckCircle size={18} />
                  Tous présents
                </button>
                <button 
                  class="md-button md-button-outlined md-ripple"
                  onClick={() => handleToggleAllPresence(false)}
                >
                  <XCircle size={18} />
                  Tous absents
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Members List Card */}
        <div class="md-card md-card-elevated">
          <div class="md-card-content">
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "16px" }}>
              <h2 class="headline-medium">Membres</h2>
              <button 
                class="md-button md-button-filled md-ripple"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>

            <Show when={loading()} fallback={
              <ul class="md-list">
                <For each={persons()}>
                  {(person) => (
                    <>
                      <li class="md-list-item">
                        <div class="md-list-item-text">
                          <div class="md-list-item-primary">{person.name}</div>
                          <div class="md-list-item-secondary">
                            <div style={{ display: "flex", gap: "8px", "margin-top": "4px" }}>
                              <span class={`md-chip ${person.present ? 'md-chip-filter selected' : 'md-chip-assist'}`}>
                                {person.present ? 'Présent' : 'Absent'}
                              </span>
                              {person.win_count > 0 && (
                                <span class="md-chip md-chip-suggestion">
                                  {person.win_count} victoire{person.win_count > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", "align-items": "center", gap: "4px" }}>
                          <label class="md-switch">
                            <input 
                              type="checkbox"
                              checked={person.present}
                              onChange={() => handleTogglePresence(person)}
                            />
                            <span class="md-switch-slider"></span>
                          </label>
                          <button 
                            class="md-icon-button"
                            onClick={() => {
                              setEditingPerson(person);
                              setEditName(person.name);
                              setEditDialogOpen(true);
                            }}
                            title="Modifier"
                          >
                            <Edit3 size={18} />
                          </button>
                          {person.win_count > 0 && (
                            <button 
                              class="md-icon-button"
                              onClick={() => handleResetPersonWins(person)}
                              title="Réinitialiser les victoires"
                              style={{ color: "var(--md-sys-color-tertiary)" }}
                            >
                              <RefreshCcw size={18} />
                            </button>
                          )}
                          <button 
                            class="md-icon-button"
                            onClick={() => handleDeletePerson(person.id)}
                            title="Supprimer"
                            style={{ color: "var(--md-sys-color-error)" }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </li>
                      <div class="md-divider"></div>
                    </>
                  )}
                </For>
              </ul>
            }>
              <div style={{ display: "flex", "justify-content": "center", padding: "48px" }}>
                <div class="md-progress-circular">
                  <svg viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke-width="4" />
                  </svg>
                </div>
              </div>
            </Show>
          </div>
        </div>

        {/* Floating Action Button */}
        <button 
          class="md-fab md-fab-large"
          style={{ 
            position: "fixed", 
            bottom: "24px", 
            right: "24px",
            "background-color": "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)"
          }}
          onClick={() => setRouletteDialogOpen(true)}
          disabled={presentCount() === 0}
        >
          <Dices size={36} />
        </button>
      </main>

      {/* Add Person Dialog */}
      <div class={`md-dialog ${addDialogOpen() ? 'open' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) setAddDialogOpen(false);
      }}>
        <div class="md-dialog-content">
          <h2 class="md-dialog-title">Ajouter un membre</h2>
          <div class="md-text-field" style={{ "margin-top": "24px" }}>
            <input
              type="text"
              class="md-text-field-input"
              value={newPersonName()}
              onInput={(e) => setNewPersonName(e.currentTarget.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
              placeholder=" "
              id="add-name"
            />
            <label for="add-name" class="md-text-field-label">Nom</label>
          </div>
          <div class="md-dialog-actions">
            <button class="md-button md-button-text md-ripple" onClick={() => setAddDialogOpen(false)}>
              Annuler
            </button>
            <button class="md-button md-button-filled md-ripple" onClick={handleAddPerson}>
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Edit Person Dialog */}
      <div class={`md-dialog ${editDialogOpen() ? 'open' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) setEditDialogOpen(false);
      }}>
        <div class="md-dialog-content">
          <h2 class="md-dialog-title">Modifier le membre</h2>
          <div class="md-text-field" style={{ "margin-top": "24px" }}>
            <input
              type="text"
              class="md-text-field-input"
              value={editName()}
              onInput={(e) => setEditName(e.currentTarget.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEditPerson()}
              placeholder=" "
              id="edit-name"
            />
            <label for="edit-name" class="md-text-field-label">Nom</label>
          </div>
          <div class="md-dialog-actions">
            <button class="md-button md-button-text md-ripple" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </button>
            <button class="md-button md-button-filled md-ripple" onClick={handleEditPerson}>
              Modifier
            </button>
          </div>
        </div>
      </div>

      {/* Roulette Dialog */}
      <div class={`md-dialog ${rouletteDialogOpen() ? 'open' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget && !isSpinning()) setRouletteDialogOpen(false);
      }}>
        <div class="md-dialog-content" style={{ "max-width": "800px" }}>
          <h2 class="md-dialog-title headline-large" style={{ "text-align": "center" }}>Roulette BNI</h2>
          <RouletteWheel 
            persons={persons().filter(p => p.present)}
            isSpinning={isSpinning()}
            winner={spinResult()}
          />
          <div class="md-dialog-actions">
            <button 
              class="md-button md-button-text md-ripple" 
              onClick={() => {
                setRouletteDialogOpen(false);
                setSpinResult(null);
                setIsSpinning(false);
              }}
              disabled={isSpinning()}
            >
              Fermer
            </button>
            <button 
              class="md-button md-button-filled md-ripple"
              onClick={handleSpinRoulette}
              disabled={isSpinning()}
            >
              {isSpinning() ? 'Tirage en cours...' : 'Lancer la roulette'}
            </button>
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <div class={`md-dialog ${historyDialogOpen() ? 'open' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) setHistoryDialogOpen(false);
      }}>
        <div class="md-dialog-content">
          <h2 class="md-dialog-title">Historique des tirages</h2>
          <ul class="md-list" style={{ "margin-top": "16px" }}>
            <For each={winners()}>
              {(winner) => (
                <>
                  <li class="md-list-item">
                    <div class="md-list-item-text">
                      <div class="md-list-item-primary">{winner.person.name}</div>
                      <div class="md-list-item-secondary">
                        {new Date(winner.won_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </li>
                  <div class="md-divider"></div>
                </>
              )}
            </For>
          </ul>
          <div class="md-dialog-actions">
            <button class="md-button md-button-text md-ripple" onClick={() => setHistoryDialogOpen(false)}>
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <Show when={error()}>
        <div 
          class="md-card"
          style={{ 
            position: "fixed", 
            bottom: "20px", 
            left: "20px", 
            "max-width": "300px",
            "background-color": "var(--md-sys-color-error-container)",
            color: "var(--md-sys-color-on-error-container)",
            "z-index": "1000",
            animation: "slideIn 0.3s ease-out"
          }}
        >
          <div class="md-card-content" style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <XCircle size={20} />
            <p class="body-medium">{error()}</p>
          </div>
        </div>
      </Show>

      <Show when={success()}>
        <div 
          class="md-card"
          style={{ 
            position: "fixed", 
            bottom: "20px", 
            left: "20px", 
            "max-width": "300px",
            "background-color": "var(--md-sys-color-tertiary-container)",
            color: "var(--md-sys-color-on-tertiary-container)",
            "z-index": "1000",
            animation: "slideIn 0.3s ease-out"
          }}
        >
          <div class="md-card-content" style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <CheckCircle size={20} />
            <p class="body-medium">{success()}</p>
          </div>
        </div>
      </Show>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default App;