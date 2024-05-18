# FMDS Av2
Avaliação 2 de FMDS. https://github.com/LeoMoraes18/FMDS_Avaliacao_2

## Regras do Firestore:
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /annotations/{document} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    match /users/{userId}/{documents=**} {
        allow read: if true;
        allow write: if request.auth != null && request.auth.uid == userId
    }
  }
}
````
# Disciplina
- Frameworks Modernos para Desenvolvimento de Sistemas
- Bacharelado em Sistemas de Informação - UNEMAT/Sinop
- Professor Ivan Pires
- Aluno Leonardo Oliveira de Moraes
