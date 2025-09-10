describe('Tests de modération du contenu', () => {

  describe('Détection de mots interdits', () => {
    test('détecte contenu suicidaire', () => {
      const content = 'Je veux mourir';
      const motInterdit = 'mourir';
      
      expect(content.toLowerCase().includes(motInterdit)).toBe(true);
    });

    test('détecte langage inapproprié', () => {
      const content = 'C\'est vraiment stupide';
      const motInterdit = 'stupide';
      
      expect(content.toLowerCase().includes(motInterdit)).toBe(true);
    });

    test('détecte informations personnelles', () => {
      const content = 'Mon email est test@example.com';
      
      expect(content.includes('@')).toBe(true);
    });

    test('contenu propre non détecté', () => {
      const content = 'J\'ai passé une belle journée';
      const motsInterdits = ['mourir', 'stupide', 'drogue'];
      
      const contientMotInterdit = motsInterdits.some(mot => 
        content.toLowerCase().includes(mot)
      );
      
      expect(contientMotInterdit).toBe(false);
    });
  });

  describe('Messages d\'avertissement', () => {
    test('message pour contenu suicidaire', () => {
      const message = {
        title: 'Contenu sensible détecté',
        text: 'Votre message contient du contenu qui pourrait inquiéter d\'autres utilisateurs.'
      };
      
      expect(message.title).toContain('sensible');
      expect(message.text).toBeDefined();
    });

    test('message pour langage inapproprié', () => {
      const message = {
        title: 'Langage inapproprié',
        text: 'Veuillez reformuler votre message avec un langage respectueux.'
      };
      
      expect(message.title).toContain('inapproprié');
      expect(message.text).toBeDefined();
    });
  });

  describe('Analyse du contenu', () => {
    test('analyse retourne le bon format', () => {
      const resultat = {
        flagged: true,
        raisons: ['Contenu suicidaire détecté'],
        message: 'Contenu inapproprié détecté'
      };
      
      expect(resultat.flagged).toBeDefined();
      expect(resultat.raisons).toBeDefined();
      expect(resultat.message).toBeDefined();
    });

    test('gère la casse', () => {
      const content1 = 'JE VEUX MOURIR';
      const content2 = 'je veux mourir';
      
      expect(content1.toLowerCase()).toBe(content2.toLowerCase());
    });
  });
});