import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Note, NoteFilters } from '../types';
import { apiService } from '../services/api';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  filters: NoteFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: NotesState = {
  notes: [],
  currentNote: null,
  filters: {
    page: 1,
    limit: 20,
    archived: false,
  },
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (filters: NoteFilters = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getNotes(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notes');
    }
  }
);

export const fetchNote = createAsyncThunk(
  'notes/fetchNote',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getNote(id);
      return response.note;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch note');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (data: { title: string; content?: string; category?: string; tags?: string[] }, { rejectWithValue }) => {
    try {
      const response = await apiService.createNote(data);
      return response.note;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create note');
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, data }: { id: string; data: Partial<Note> }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateNote(id, data);
      return response.note;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteNote(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<NoteFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateNoteContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const { id, content } = action.payload;
      const note = state.notes.find(note => note.id === id);
      if (note) {
        note.content = content;
        note.updatedAt = new Date().toISOString();
      }
      if (state.currentNote && state.currentNote.id === id) {
        state.currentNote.content = content;
        state.currentNote.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single note
      .addCase(fetchNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNote = action.payload;
        state.error = null;
      })
      .addCase(fetchNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create note
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
        state.currentNote = action.payload;
      })
      // Update note
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote && state.currentNote.id === action.payload.id) {
          state.currentNote = action.payload;
        }
      })
      // Delete note
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(note => note.id !== action.payload);
        if (state.currentNote && state.currentNote.id === action.payload) {
          state.currentNote = null;
        }
      });
  },
});

export const { setFilters, clearFilters, setCurrentNote, clearError, updateNoteContent } = notesSlice.actions;
export default notesSlice.reducer;