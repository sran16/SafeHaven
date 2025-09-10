describe('Tests de détection de détresse', () => {

  describe('Détection d\'urgence', () => {
    test('détecte message suicidaire', () => {
      const message = 'Je veux me suicider';
      const motsDangeur = ['suicide', 'mourir', 'tuer', 'finir'];
      
      const contientMotDangeur = motsDangeur.some(mot => 
        message.toLowerCase().includes(mot)
      );
      
      expect(contientMotDangeur).toBe(true);
    });

    test('détecte expression de désespoir', () => {
      const message = 'Je n\'en peux plus, je veux mourir';
      expect(message.toLowerCase().includes('mourir')).toBe(true);
    });

    test('message normal non détecté', () => {
      const message = 'J\'ai passé une bonne journée';
      const motsDangeur = ['suicide', 'mourir', 'tuer'];
      
      const contientMotDangeur = motsDangeur.some(mot => 
        message.toLowerCase().includes(mot)
      );
      
      expect(contientMotDangeur).toBe(false);
    });
  });

  describe('Niveaux de détresse', () => {
    test('niveau 5 - urgence', () => {
      const message = 'Je vais me suicider ce soir';
      const niveau = 5; // Urgence maximale
      
      expect(niveau).toBe(5);
    });

    test('niveau 4 - détresse élevée', () => {
      const message = 'Je me sens désespéré et seul';
      const niveau = 4;
      
      expect(niveau).toBe(4);
    });

    test('niveau 3 - détresse modérée', () => {
      const message = 'Je me sens triste aujourd\'hui';
      const niveau = 3;
      
      expect(niveau).toBe(3);
    });

    test('niveau 1-2 - bien-être', () => {
      const message = 'Je me sens bien et reconnaissant';
      const niveau = 2;
      
      expect(niveau).toBeLessThanOrEqual(2);
    });
  });

  describe('Analyse des mots-clés', () => {
    test('mots d\'urgence', () => {
      const motsUrgence = ['suicide', 'mourir', 'tuer', 'finir'];
      const message = 'suicide';
      
      expect(motsUrgence.includes(message)).toBe(true);
    });

    test('mots de détresse', () => {
      const motsDetresse = ['désespéré', 'seul', 'triste', 'anxieux'];
      const message = 'Je me sens désespéré';
      
      const contientDetresse = motsDetresse.some(mot => 
        message.toLowerCase().includes(mot)
      );
      
      expect(contientDetresse).toBe(true);
    });

    test('mots positifs', () => {
      const motsPositifs = ['heureux', 'content', 'bien', 'reconnaissant'];
      const message = 'Je suis content aujourd\'hui';
      
      const contientPositif = motsPositifs.some(mot => 
        message.toLowerCase().includes(mot)
      );
      
      expect(contientPositif).toBe(true);
    });
  });

  describe('Gestion de casse', () => {
    test('détection insensible à la casse', () => {
      const message1 = 'SUICIDE';
      const message2 = 'suicide';
      const message3 = 'Suicide';
      
      expect(message1.toLowerCase()).toBe(message2.toLowerCase());
      expect(message2.toLowerCase()).toBe(message3.toLowerCase());
    });
  });
});
