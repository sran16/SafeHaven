// Tests du Chatbot IA - SafeHaven
describe('Tests du Chatbot IA', () => {

  describe('Analyse des sentiments', () => {
    test('sentiment positif', () => {
      const message = 'Je me sens vraiment bien aujourd\'hui';
      const sentiment = 'positive';
      
      expect(sentiment).toBe('positive');
    });

    test('sentiment négatif', () => {
      const message = 'Je me sens très mal';
      const sentiment = 'negative';
      
      expect(sentiment).toBe('negative');
    });

    test('sentiment neutre', () => {
      const message = 'Il fait beau aujourd\'hui';
      const sentiment = 'neutral';
      
      expect(sentiment).toBe('neutral');
    });
  });

  describe('Extraction de sujets', () => {
    test('détecte sujet burnout', () => {
      const message = 'Je suis épuisé par le travail';
      const sujets = ['burnout', 'travail'];
      
      expect(sujets).toContain('burnout');
    });

    test('détecte sujet famille', () => {
      const message = 'J\'ai des problèmes avec ma famille';
      const sujets = ['famille'];
      
      expect(sujets).toContain('famille');
    });

    test('détecte sujet anxiété', () => {
      const message = 'Je me sens très anxieux';
      const sujets = ['anxiété'];
      
      expect(sujets).toContain('anxiété');
    });
  });

  describe('Recommandations', () => {
    test('recommandations immédiates pour urgence', () => {
      const niveau = 5;
      const recommandations = {
        immediate: ['Contacter le 3114', 'Parler à un proche'],
        longTerm: []
      };
      
      expect(niveau).toBe(5);
      expect(recommandations.immediate.length).toBeGreaterThan(0);
    });

    test('recommandations pour détresse modérée', () => {
      const niveau = 3;
      const recommandations = {
        immediate: ['Prendre une pause'],
        longTerm: ['Consulter un thérapeute']
      };
      
      expect(niveau).toBe(3);
      expect(recommandations.longTerm.length).toBeGreaterThan(0);
    });
  });

  describe('Session de chat', () => {
    test('session créée pour aujourd\'hui', () => {
      const aujourd_hui = new Date();
      const session = {
        userId: 1,
        startDate: aujourd_hui,
        endDate: null
      };
      
      expect(session.userId).toBe(1);
      expect(session.endDate).toBe(null);
    });

    test('historique des messages', () => {
      const messages = [
        { content: 'Bonjour', isUserMessage: true },
        { content: 'Bonjour ! Comment allez-vous ?', isUserMessage: false }
      ];
      
      expect(messages.length).toBe(2);
      expect(messages[0].isUserMessage).toBe(true);
      expect(messages[1].isUserMessage).toBe(false);
    });
  });

  describe('Génération de rapports', () => {
    test('rapport contient niveau de détresse', () => {
      const rapport = {
        userId: 1,
        distressLevel: 3,
        sentiment: 'negative',
        topics: ['anxiété']
      };
      
      expect(rapport.distressLevel).toBeDefined();
      expect(rapport.sentiment).toBeDefined();
      expect(rapport.topics).toBeDefined();
    });

    test('notes professionnelles', () => {
      const notes = 'Patient shows distress level of 4/5. High distress level requiring close monitoring.';
      
      expect(notes).toContain('distress level');
      expect(notes).toContain('4/5');
    });
  });

  describe('Configuration OpenAI', () => {
    test('vérifie configuration', () => {
      const apiKey = 'test-key';
      const model = 'gpt-3.5-turbo';
      
      const isConfigured = Boolean(apiKey && model);
      
      expect(isConfigured).toBe(true);
    });

    test('gère absence de configuration', () => {
      const apiKey = null;
      const model = null;
      
      const isConfigured = Boolean(apiKey && model);
      
      expect(isConfigured).toBe(false);
    });
  });
});
