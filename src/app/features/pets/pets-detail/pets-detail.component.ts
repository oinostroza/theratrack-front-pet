import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PetsService } from '../services/pets.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';

@Component({
  selector: 'app-pets-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorDisplayComponent],
  templateUrl: './pets-detail.component.html',
  styleUrl: './pets-detail.component.css'
})
export class PetsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly petsService = inject(PetsService);

  readonly selectedPet = this.petsService.selectedPet;
  readonly isLoading = this.petsService.isLoading;
  readonly error = this.petsService.error;

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id');
    if (petId) {
      this.petsService.getPetById(petId).subscribe();
    }
  }

  deletePet(): void {
    const pet = this.selectedPet();
    if (pet && confirm(`¿Estás seguro de eliminar a ${pet.name}?`)) {
      this.petsService.deletePet(pet.id).subscribe((success) => {
        if (success) {
          this.router.navigate(['/pets']);
        }
      });
    }
  }
}

