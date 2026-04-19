import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-neutral-50 p-6">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-neutral-900 mb-8">Mon Profil</h1>
        
        <div class="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <!-- Header/Avatar -->
          <div class="h-32 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
          
          <div class="px-8 pb-8">
            <div class="relative flex justify-between items-end -mt-12 mb-6">
              <div class="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                <div class="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {{ userInitial }}
                </div>
              </div>
              <button class="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                Modifier le profil
              </button>
            </div>
            
            <div class="space-y-6">
              <div>
                <h2 class="text-2xl font-bold text-neutral-900">{{ user?.name }}</h2>
                <p class="text-neutral-500">{{ user?.email }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-100">
                <div>
                  <label class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Rôle</label>
                  <p class="mt-1 text-neutral-900 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                    {{ user?.role }}
                  </p>
                </div>
                <div>
                  <label class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Statut du Compte</label>
                  <p class="mt-1 text-success-600 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-success-500"></span>
                    Actif
                  </p>
                </div>
              </div>

              <div class="pt-6 border-t border-neutral-100">
                <h3 class="text-sm font-semibold text-neutral-900 mb-4">Statistiques du compte</h3>
                <div class="grid grid-cols-3 gap-4">
                  <div class="bg-neutral-50 p-4 rounded-xl text-center">
                    <p class="text-2xl font-bold text-primary-600">3</p>
                    <p class="text-xs text-neutral-500">Projets</p>
                  </div>
                  <div class="bg-neutral-50 p-4 rounded-xl text-center">
                    <p class="text-2xl font-bold text-secondary-600">12</p>
                    <p class="text-xs text-neutral-500">Tâches</p>
                  </div>
                  <div class="bg-neutral-50 p-4 rounded-xl text-center">
                    <p class="text-2xl font-bold text-success-600">95%</p>
                    <p class="text-xs text-neutral-500">Productivité</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: any;
  userInitial = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user?.name) {
      this.userInitial = this.user.name.charAt(0).toUpperCase();
    }
  }
}
