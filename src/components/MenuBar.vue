<template>
    <v-app-bar class="px-3" density="compact" flat color="lime-darken-1">
      <v-app-bar-title>P2 FMDS - LM INFORMÁTICA</v-app-bar-title>
      <v-spacer />
      <v-botton-navigation v-show="!!userStore.isAuthenticated">
        <v-btn v-for="(item, i) in items" :key="i" :to="item.to" text>
          <div class="md-2">
            <v-icon>{{ item.icon }}</v-icon>
          </div>
          {{ item.text }}
        </v-btn>
      </v-botton-navigation>
  
      <v-spacer />
      <template v-slot:append>
        <v-list-item 
                lines="two"
                :prepend-avatar="userStore.user.photoURL" 
                :subtitle="userStore.user.email"
                :title="userStore.user.displayName" />
                <div class="mr-4">
                  <v-btn flat class="bg-lime-darken-4" v-if="!!userStore.isAuthenticated" @click="userStore.signOut">
                    <v-icon>mdi-logout</v-icon>
                  </v-btn>
                  <v-btn flat class="bg-lime-darken-4" v-else @click="userStore.signIn">
                    Login
                    <v-icon >mdi-login</v-icon>
                  </v-btn>
                </div>
        </template>
    </v-app-bar>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore();

const items = [
    { text: 'Lista de Anotações', icon: 'mdi-format-list-bulleted', to: '/' },
    { text: 'Inserir Anotações', icon: 'mdi-note-plus-outline', to: '/annotations' }
]
</script>