import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PetsService } from './pets.service';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { Pet } from '../../../core/models/pet.model';

describe('PetsService', () => {
  let service: PetsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PetsService]
    });
    service = TestBed.inject(PetsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get pets', () => {
    const mockPets: Pet[] = [
      { id: '1', name: 'Max', species: 'Dog', ownerId: '1' },
      { id: '2', name: 'Luna', species: 'Cat', ownerId: '2' }
    ];

    service.getPets().subscribe(pets => {
      expect(pets.length).toBe(2);
      expect(pets).toEqual(mockPets);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.PETS}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPets);
  });

  it('should get pet by id', () => {
    const mockPet: Pet = { id: '1', name: 'Max', species: 'Dog', ownerId: '1' };

    service.getPetById('1').subscribe(pet => {
      expect(pet).toEqual(mockPet);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.PETS}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPet);
  });

  it('should create pet', () => {
    const newPet = { name: 'Max', species: 'Dog' };
    const createdPet: Pet = { id: '1', ...newPet, ownerId: '1' };

    service.createPet(newPet).subscribe(pet => {
      expect(pet).toEqual(createdPet);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.PETS}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newPet);
    req.flush(createdPet);
  });

  it('should handle errors', () => {
    service.getPets().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.PETS}`);
    req.error(new ErrorEvent('Network error'));
  });
});

