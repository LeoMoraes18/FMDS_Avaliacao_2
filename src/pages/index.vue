<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <h2>Relatório de Anotações</h2>
  <v-container v-if="annotations.length > 0">
    <v-row justify="end" v-if="userStore.isAuthenticated">
      <v-col cols="12" sm="6" md="4">
        <v-select v-model="filter" :items="filterOptions" label="Filtrar Anotações"></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="(item, index) in filteredAnnotations" :key="index" cols="12" sm="6" md="4" lg="3">
        <v-card class="mx-auto mt-4" elevation="5">
          <v-card-text class="pa-5">
            <v-text-field label="Autor" :model-value="getOwnerName(item.ownerId)" readonly>
              <template v-slot:prepend-inner>
                <v-avatar>
                  <v-img alt="Avatar" :src="getOwnerAvatar(item.ownerId)"></v-img>
                </v-avatar>
              </template>
            </v-text-field>
            <v-divider />
            <v-text-field label="Título" v-model="item.title" readonly></v-text-field>
            <v-textarea label="Descrição" v-model="item.description" readonly></v-textarea>
            <v-checkbox label="Público" v-model="item.public" readonly></v-checkbox>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-row justify="center">
      <v-col cols="12" sm="6" md="4">
        <v-card>
          <v-card-title>Sem anotações</v-card-title>
          <v-card-text>Realize o login para cadastrar!</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore';
import { useUserStore } from '@/stores/user';
import db from '@/plugins/firebase'

const userStore = useUserStore();

const usersCollection = collection(db, 'users');
const users = ref([]);

const annotationsCollection = collection(db, 'annotations');
const annotations = ref([]);

// Função para carregar dados dos usuários e anotações ao montar o componente
onMounted(() => {
  loadAnnotations();
  loadUsers();
});

// Função para carregar anotações
const loadAnnotations = () => {
  onSnapshot(annotationsCollection, (snapshot) => {
    annotations.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
};

// Função para carregar usuários
const loadUsers = () => {
  onSnapshot(usersCollection, (snapshot) => {
    users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
};

// Função para obter avatar do dono da anotação
const getOwnerAvatar = (ownerId) => {
  const user = users.value.find(user => user.id === ownerId);
  return user ? user.photoURL : '';
}

// Função para obter nome do dono da anotação
const getOwnerName = (ownerId) => {
  const user = users.value.find(user => user.id === ownerId);
  return user ? user.displayName : 'Desconhecido';
}

const filter = ref('Todas');
const filterOptions = ['Públicas', 'Privadas', 'Todas'];

// Função computada para filtrar anotações com base no filtro selecionado
const filteredAnnotations = computed(() => {
  if (!userStore.isAuthenticated) {
    return annotations.value.filter(item => item.public);
  }
  
  switch (filter.value) {
    case 'Públicas':
      return annotations.value.filter(item => item.public);
    case 'Privadas':
      return annotations.value.filter(item => item.ownerId === userStore.user.uid && !item.public);
    default:
      return annotations.value.filter(item => item.public || item.ownerId === userStore.user.uid);
  }
});

</script>

<style scoped>

</style>