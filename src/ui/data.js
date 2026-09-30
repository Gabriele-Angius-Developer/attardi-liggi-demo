// Site copy and lists (verbatim from the approved prototype).
export const COMPS = [
  ['Implantoprotesi', ['Protesi su impianti', 'Abutment', 'Strutture in titanio', 'Strutture in zirconia', 'Overdenture', 'Toronto Bridge', 'Provvisori su impianti']],
  ['Protesi fissa', ['Corone', 'Ponti', 'Metallo-ceramica', 'Zirconia', 'Ceramica su zirconia', 'Maryland Bridge', 'Fissa su impianti']],
  ['Estetica & Ceramica', ['Ceramica integrale', 'E.max', 'Ceramica pressata', 'Faccette in disilicato', 'Faccette in composito', 'Inlay', 'Onlay', 'Finitura zirconia']],
  ['Protesi mobile & combinata', ['Protesi totali', 'Protesi parziali', 'Protesi combinata', 'Scheletrati', 'Soluzioni in BioHPP', 'Ribasature', 'Riparazioni']],
  ['Provvisori', ['PMMA', 'Provvisori fibrorinforzati', 'Provvisori su impianti', 'Provvisori in resina', 'Provvisori rinforzati']],
  ['Pianificazione & Servizi', ['Previsualizzazione', 'Guide chirurgiche', 'Bite', 'Dispositivi di contenzione', 'Mascherine sbiancanti', 'Placche di Farrar', 'Riparazioni e servizi tecnici']],
];
// Service hotspot -> [competence index, label]
export const NODE_MAP = [[2, 'CERAMICA'], [0, 'IMPIANTO'], [1, 'PONTE'], [3, 'MOBILE'], [4, 'PROVVISORI'], [5, 'PIANIFICAZIONE']];
export const STEPS = [
  ['01', 'Caso', 'Arrivano scansioni, impronte e indicazioni dello studio. Si definisce insieme la soluzione.'],
  ['02', 'Progetto', 'La corona prende forma in digitale: anatomia, spessori, connessioni, occlusione.'],
  ['03', 'Produzione', 'La geometria diventa materia. Il file digitale prende forma attraverso processi di lavorazione, passando dal progetto alla sua realizzazione.'],
  ['04', 'Finitura', 'Ulteriori interventi di perfezionamento, colore e caratterizzazione vengono eseguiti manualmente, fino alla finitura definitiva.'],
  ['05', 'Controllo', 'Verifica di adattamento, contatti e superfici prima della consegna.'],
  ['06', 'Collaborazione', 'Il restauro torna allo studio e diventa parte del caso.'],
];
export const PILLARS = ['Collaborazione tecnica', 'Precisione esecutiva', 'Competenza protesica', 'Conoscenza dei materiali'];
export const IMPLANT_LABELS = [['i0', 'CORONA', 'zirconia / ceramica', 'CORONA'], ['i1', 'ABUTMENT', 'titanio / zirconia', 'ABUTMENT'], ['i2', 'VITE / CONNESSIONE', 'titanio', 'VITE'], ['i3', 'IMPIANTO', '[DA VERIFICARE] sistemi compatibili', 'IMPIANTO']];
export const IMPLANT_SERVICES = ['Protesi su impianti', 'Abutment', 'Strutture in titanio', 'Strutture in zirconia', 'Overdenture', 'Toronto Bridge', 'Provvisori su impianti', 'Guide chirurgiche'];
export const MATERIALS = [['Zirconia', 'zirc'], ['Disilicato di litio / E.max', 'emax'], ['Titanio', 'ti'], ['CoCr', 'cocr'], ['PEEK', 'peek'], ['BioHPP', 'biohpp'], ['PMMA', 'pmma'], ['Composito', 'comp'], ['Resina', 'resin'], ['Ceramica', 'ceramic']];
export const BRIDGE_ITEMS = ['ANATOMIA ESTERNA', 'SUPERFICIE INFERIORE', 'CONNESSIONI', 'MATERIALE', 'DETTAGLIO DI SUPERFICIE'];
export const COMPLEX_ITEMS = ['TORONTO BRIDGE', 'OVERDENTURE', 'SU IMPIANTI', 'MARYLAND BRIDGE', 'FISSA COMPLESSA', 'PREVISUALIZZAZIONE'];
export const FIELDS = [['STUDIO', 'Nome dello studio', 'text'], ['REFERENTE', 'Dott. / Dott.ssa', 'text'], ['EMAIL', 'studio@', 'email'], ['TELEFONO', '+39', 'tel']];
export const REQ_TYPES = ['Valutazione di un caso', 'Nuova collaborazione', 'Informazioni tecniche'];

// Verified contact data (provided by the client). Unverified items stay flagged.
export const CONTACT = {
  legal: 'LABORATORIO ODONTOTECNICO ATTARDI L. E LIGGI M. SNC',
  street: 'Via Giuseppe Peretti, 1c', city: '09121 Cagliari CA',
  phone: '070 540570', phoneHref: 'tel:+39070540570',
  email: '[DA VERIFICARE]', hours: '[DA VERIFICARE] chiusura ore 20 · giorni e apertura',
};
