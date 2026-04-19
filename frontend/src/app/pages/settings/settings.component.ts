import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-neutral-50 p-6">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-neutral-900 mb-8">Paramètres</h1>
        
        <div class="space-y-6">
          <!-- Account Settings -->
          <div class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div class="p-6 border-b border-neutral-100">
              <h2 class="text-lg font-semibold text-neutral-900">Compte</h2>
              <p class="text-sm text-neutral-500">Gérez vos informations personnelles et votre sécurité.</p>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between py-2">
                <div>
                  <p class="text-sm font-medium text-neutral-900">Adresse Email</p>
                  <p class="text-xs text-neutral-500">Changer votre adresse email principale.</p>
                </div>
                <button class="text-sm text-primary-600 font-medium hover:text-primary-700">Modifier</button>
              </div>
              <div class="flex items-center justify-between py-2 border-t border-neutral-50">
                <div>
                  <p class="text-sm font-medium text-neutral-900">Mot de passe</p>
                  <p class="text-xs text-neutral-500">Mettre à jour votre mot de passe pour plus de sécurité.</p>
                </div>
                <button class="text-sm text-primary-600 font-medium hover:text-primary-700">Mettre à jour</button>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div class="p-6 border-b border-neutral-100">
              <h2 class="text-lg font-semibold text-neutral-900">Notifications</h2>
              <p class="text-sm text-neutral-500">Choisissez comment vous souhaitez être informé.</p>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between py-2">
                <div>
                  <p class="text-sm font-medium text-neutral-900">Emails de rapport</p>
                  <p class="text-xs text-neutral-500">Recevoir un résumé hebdomadaire de vos projets.</p>
                </div>
                <input type="checkbox" checked class="w-10 h-5 bg-neutral-200 rounded-full appearance-none checked:bg-primary-500 transition-colors cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform checked:after:translate-x-5">
              </div>
              <div class="flex items-center justify-between py-2 border-t border-neutral-50">
                <div>
                  <p class="text-sm font-medium text-neutral-900">Alertes Navigateur</p>
                  <p class="text-xs text-neutral-500">Notifications instantanées pour les nouvelles tâches.</p>
                </div>
                <input type="checkbox" checked class="w-10 h-5 bg-neutral-200 rounded-full appearance-none checked:bg-primary-500 transition-colors cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform checked:after:translate-x-5">
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="bg-white rounded-xl shadow-sm border border-danger-100 overflow-hidden">
            <div class="p-6 border-b border-danger-50 bg-danger-50/50">
              <h2 class="text-lg font-semibold text-danger-700">Zone de danger</h2>
              <p class="text-sm text-danger-600">Actions irréversibles pour votre compte.</p>
            </div>
            <div class="p-6">
              <button class="px-4 py-2 bg-danger-600 text-white rounded-lg text-sm font-medium hover:bg-danger-700 transition-colors">
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {}
