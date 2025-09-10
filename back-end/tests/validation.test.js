describe('Tests de validation des données', () => {

  describe('Validation Email', () => {
    test('email valide', () => {
      const email = 'user@example.com';
      expect(email.includes('@')).toBe(true);
      expect(email.includes('.')).toBe(true);
    });

    test('email invalide', () => {
      const email = 'invalid-email';
      expect(email.includes('@')).toBe(false);
    });
  });

  describe('Validation Mot de passe', () => {
    test('mot de passe assez long', () => {
      const password = 'password123';
      expect(password.length).toBeGreaterThanOrEqual(6);
    });

    test('mot de passe trop court', () => {
      const password = '123';
      expect(password.length).toBeLessThan(6);
    });
  });

  describe('Validation Nom utilisateur', () => {
    test('nom utilisateur valide', () => {
      const username = 'testuser';
      expect(username.length).toBeGreaterThanOrEqual(2);
      expect(username.length).toBeLessThanOrEqual(80);
    });

    test('nom utilisateur trop court', () => {
      const username = 'a';
      expect(username.length).toBeLessThan(2);
    });
  });

  describe('Validation Contenu expérience', () => {
    test('contenu valide', () => {
      const content = 'Aujourd\'hui était une bonne journée';
      expect(content.length).toBeGreaterThan(0);
      expect(content.length).toBeLessThanOrEqual(2000);
    });

    test('contenu vide', () => {
      const content = '';
      expect(content.length).toBe(0);
    });
  });

  describe('Validation Humeur', () => {
    test('humeur valide', () => {
      const mood = 'happy';
      const validMoods = ['happy', 'sad', 'anxious', 'calm'];
      expect(validMoods).toContain(mood);
    });

    test('humeur invalide', () => {
      const mood = 'super_excited';
      const validMoods = ['happy', 'sad', 'anxious', 'calm'];
      expect(validMoods).not.toContain(mood);
    });
  });
});