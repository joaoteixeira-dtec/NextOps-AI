// Setup script — creates initial users in Firebase Auth + Firestore
// Run once: node scripts/setup-users.mjs

const API_KEY = "AIzaSyBqilpdA1TaziiZKCxmKz8AWUe-yKuU5es";
const PROJECT_ID = "no2026";

const USERS = [
  {
    email: "admin@nextops-ai.com",
    password: "123456",
    name: "Admin",
    role: "admin",
  },
  {
    email: "joao@nextops-ai.com",
    password: "123456",
    name: "João Brites",
    role: "tecnico",
  },
  {
    email: "luis@nextops-ai.com",
    password: "123456",
    name: "Luis",
    role: "comercial",
  },
];

async function createAuthUser(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (data.error) {
    if (data.error.message === "EMAIL_EXISTS") {
      console.log(`  ⚠ ${email} já existe, a obter UID...`);
      // Sign in to get the UID
      const signInRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      const signInData = await signInRes.json();
      if (signInData.error) throw new Error(`Sign-in failed for ${email}: ${signInData.error.message}`);
      return { uid: signInData.localId, idToken: signInData.idToken };
    }
    throw new Error(`Auth error for ${email}: ${data.error.message}`);
  }
  return { uid: data.localId, idToken: data.idToken };
}

async function createFirestoreProfile(uid, idToken, userData) {
  const now = new Date().toISOString();
  const fields = {
    email: { stringValue: userData.email },
    name: { stringValue: userData.name },
    role: { stringValue: userData.role },
    active: { booleanValue: true },
    createdAt: { stringValue: now },
  };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?documentId=${uid}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields }),
    }
  );
  const data = await res.json();
  if (data.error) {
    // Try PATCH (update) if doc already exists
    if (data.error.code === 409) {
      console.log(`  ⚠ Perfil Firestore já existe para ${userData.name}, a atualizar...`);
      const patchRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ fields }),
        }
      );
      const patchData = await patchRes.json();
      if (patchData.error) throw new Error(`Firestore update error: ${JSON.stringify(patchData.error)}`);
      return patchData;
    }
    throw new Error(`Firestore error: ${JSON.stringify(data.error)}`);
  }
  return data;
}

async function main() {
  console.log("🔧 NextOps AI — Setup de Utilizadores\n");

  for (const user of USERS) {
    console.log(`→ A criar ${user.name} (${user.email}) como ${user.role}...`);
    try {
      const { uid, idToken } = await createAuthUser(user.email, user.password);
      console.log(`  ✓ Auth criado — UID: ${uid}`);
      await createFirestoreProfile(uid, idToken, user);
      console.log(`  ✓ Perfil Firestore criado`);
    } catch (err) {
      console.error(`  ✗ Erro: ${err.message}`);
    }
    console.log();
  }

  console.log("✅ Setup concluído!");
  console.log("\nCredenciais:");
  console.log("┌─────────────────────────────────────────────────┐");
  for (const u of USERS) {
    console.log(`│ ${u.role.padEnd(10)} │ ${u.email.padEnd(24)} │ ${u.password} │`);
  }
  console.log("└─────────────────────────────────────────────────┘");
}

main().catch(console.error);
