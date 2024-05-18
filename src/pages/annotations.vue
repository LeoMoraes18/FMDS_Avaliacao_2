<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-snackbar v-model="successSaveMessage" color="success" timeout="3000" location="top">
        <v-icon icon="mdi-check-circle"></v-icon>
        salva com sucesso!
    </v-snackbar>
    <v-snackbar v-model="successDeleteMessage" color="success" timeout="3000" location="top">
        <v-icon icon="mdi-check-circle"></v-icon>
        excluido com sucesso!
    </v-snackbar>

    <v-dialog v-model="dialogAdd" max-width="500px">
        <v-card>
            <v-card-title>Adicionar Anotação</v-card-title>
            <v-card-text class="pa-5">
                <v-text-field :rules="ruleText" v-model="newAnnotation.title" label="Título da Anotação" dense hide-details></v-text-field>
                <v-textarea :rules="ruleText" v-model="newAnnotation.description" label="Descrição da Anotação" dense hide-details></v-textarea>
                <v-checkbox v-model="newAnnotation.public" label="Pública"></v-checkbox>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn @click="createAnnotation()" variant="tonal" color="success" :disabled="isSaveDisabled">
                    Cadastrar Anotação
                    <v-icon icon="mdi-chevron-right" end></v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEdit" max-width="500px">
        <v-card>
            <v-card-title>Editar Anotação</v-card-title>
            <v-card-text class="pa-5">
                <v-text-field :rules="ruleText" v-model="annotationToEdit.title" label="Título da Anotação" dense hide-details></v-text-field>
                <v-textarea :rules="ruleText" v-model="annotationToEdit.description" label="Descrição da Anotação" dense hide-details></v-textarea>
                <v-checkbox v-model="annotationToEdit.public" label="Pública"></v-checkbox>
                <v-divider />
                <v-checkbox v-model="confirmChanges" label="Confirmar alterações"></v-checkbox>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn @click="updateAnnotation()" variant="tonal" color="primary" :disabled="!confirmChanges">Salvar</v-btn>
                <v-btn @click="cancelAnnotationEdit()" variant="tonal" color="error">Cancelar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="300">
        <v-card>
            <v-card-title class="headline">Confirmar Exclusão</v-card-title>
            <v-card-text>Tem certeza de que deseja excluir esta anotação?</v-card-text>
            <v-card-actions>
                <v-btn color="error" text @click="confirmDeleteAnnotation()">Confirmar</v-btn>
                <v-btn text @click="dialogDelete = false">Cancelar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-container>
        <v-row>
            <v-col cols="3">
                <v-btn @click="openAddDialog()" color="lime-darken-4" dark>Nova Anotação</v-btn>
            </v-col>
        </v-row>
    </v-container>

    <v-container v-if="annotations.length > 0">
        <v-card class="elevate">
            <v-card-title class="title">Suas Anotações</v-card-title>
            <v-card-text>
                <v-row justify="end">
                    <v-col cols="2">
                        <v-text-field v-model="search" label="Pesquisar" dense hide-details></v-text-field>
                    </v-col>
                </v-row>

                <v-data-table :headers="headers" :items="filteredAnnotations" item-key="title" :search="search">
                    <template v-slot:[`item.public`]="{ item }">
                        <v-checkbox v-model="item.public" :readonly="true"></v-checkbox>
                    </template>
                    <template v-slot:[`item.actions`]="{ index }">
                        <v-icon @click="openEditDialog(index)" class="actionbtn">mdi-pencil</v-icon>
                        <v-icon @click="openDeleteDialog(index)" class="actionbtn">mdi-delete</v-icon>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>

    <v-container v-else>
        <v-row justify="center">
            <v-col cols="12" sm="6" md="4">
                <v-card>
                    <v-card-title>Nenhuma anotação sua cadastrada</v-card-title>
                    <v-card-text>Clique em Nova Anotação para cadastrar.</v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, where, query } from 'firebase/firestore';
import { useUserStore } from '@/stores/user';
import db from '@/plugins/firebase'

const userStore = useUserStore();
const search = ref('');

const annotationsCollection = collection(db, 'annotations');
const annotations = ref([]);

onMounted(() => {
    const q = query(
        annotationsCollection, where('ownerId', '==', `${userStore.user.uid}`));
    onSnapshot(q, (snapshot) => {
        annotations.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    });
});

const dialogAdd = ref(false);
const dialogEdit = ref(false);
const dialogDelete = ref(false);
const successSaveMessage = ref(false);
const successDeleteMessage = ref(false);
const confirmChanges = ref(false);

const headers = [
    { title: 'Título', align: 'start', sortable: false, value: 'title' },
    { title: 'Descrição', value: 'description' },
    { title: 'Público', value: 'public' },
    { title: 'Ações', value: 'actions', sortable: false }
];

const ruleText = [
    (v) => !!v || 'Campo obrigatório'
]
const isSaveDisabled = computed(() => {
    return !newAnnotation.value.description;
});

const newAnnotation = ref({ ownerId: '', title: '', public: false, description: '' });
const annotationToEdit = ref(null);
const annotationToDelete = ref(null);

const openAddDialog = () => {
    dialogAdd.value = true;
};

const createAnnotation = async () => {
    await addDoc(annotationsCollection, { ownerId: userStore.user.uid, public: newAnnotation.value.public, title: newAnnotation.value.title, description: newAnnotation.value.description });
    dialogAdd.value = false;
    successSaveMessage.value = true;
    newAnnotation.value = { ownerId: '', title: '', public: false, description: '' };
};

const openEditDialog = (index) => {
    annotationToEdit.value = { ...annotations.value[index] };
    dialogEdit.value = true;
};

const cancelAnnotationEdit = () => {
    confirmChanges.value = false;
    dialogEdit.value = false;
};

const updateAnnotation = async () => {
    await updateDoc(doc(annotationsCollection, annotationToEdit.value.id), {
        title: annotationToEdit.value.title,
        description: annotationToEdit.value.description,
        public: annotationToEdit.value.public
    });
    cancelAnnotationEdit();
    successSaveMessage.value = true;
};

const openDeleteDialog = (index) => {
    annotationToDelete.value = { ...annotations.value[index] };
    dialogDelete.value = true;
};

const confirmDeleteAnnotation = async () => {
    await deleteDoc(doc(annotationsCollection, annotationToDelete.value.id));
    dialogDelete.value = false;
    successDeleteMessage.value = true;
};

const filteredAnnotations = computed(() => {
    return annotations.value.filter(annotation => {
        return (
            annotation.title.toLowerCase().includes(search.value.toLowerCase()) ||
            annotation.description.toLowerCase().includes(search.value.toLowerCase())
        );
    });
});
</script>

<style scoped>

</style>
