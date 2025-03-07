import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonButton, IonIcon, IonAlert, IonModal, IonInput, IonItemDivider } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useIonRouter } from '@ionic/react';
import { trashOutline, pencilOutline } from 'ionicons/icons';
import BottomSheetModal from '../../components/bottomSheetModal';
import AddServiceForm from '../../components/forms/addService';

export default function ProfilePage() {

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [showAlert, setShowAlert] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedPrice, setEditedPrice] = useState('');
    const [editedTags, setEditedTags] = useState('');

    const [bottomSheetModalOpen, setBottomSheetModalOpen] = useState(false);

    const [providerID, setProviderID] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
          setLoading(true);
          setErrorMsg(null);
          
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
    
          if (userError || !user) {
            setErrorMsg('Ingen bruker funnet eller feil ved henting av bruker.');
            setLoading(false);
            return;
          }
    
          // 2. Hent provider knyttet til den innloggede brukeren
          const { data: provider, error: providerError } = await supabase
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single();
    
          if (providerError || !provider) {
            setErrorMsg('Kunne ikke finne tilknyttet provider for brukeren.');
            setLoading(false);
            return;
          }
    
          // 3. Hent alle services for denne provideren
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('provider_id', provider.id);
            setProviderID(provider.id);
    
          if (servicesError) {
            setErrorMsg('Feil ved henting av tjenester: ' + servicesError.message);
          } else {
            setServices(servicesData || []);
          }
    
          setLoading(false);
        };
    
        fetchServices();
      }, []);

      const router = useIonRouter();

    const navigateToDetailsOnly = () => {
        router.push('/detailsonly', 'forward');
    }

    const confirmDeleteService = (service) => {
        setServiceToDelete(service);
        setShowAlert(true);
      };

    const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceToDelete.id);

    if (error) {
        console.error('Feil ved sletting av tjeneste:', error.message);
        alert('Kunne ikke slette tjeneste: ' + error.message);
    } else {
        // Oppdater lokale tjenester etter sletting
        setServices(services.filter(service => service.id !== serviceToDelete.id));
        alert('Tjeneste slettet!');
    }

    // Nullstill tilstand
    setServiceToDelete(null);
    setShowAlert(false);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        // Sett forhåndsutfylte verdier fra valgt tjeneste
        setEditedTitle(service.title);
        setEditedPrice(service.price.toString());
        setEditedTags(service.tags ? service.tags.join(', ') : '');
        setIsModalOpen(true);
      };
    
      // Lukk modal
      const closeEditModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
      };
    
      // Håndter lagring av redigering
      const handleSaveEdit = async () => {
        if (!editingService) return;
    
        const updatedData = {
          title: editedTitle,
          price: parseFloat(editedPrice),
          tags: editedTags.split(',').map(tag => tag.trim()),
        };
    
        // Oppdater tjeneste i Supabase
        //eslint-disable-next-line
        const { data, error } = await supabase
          .from('services')
          .update(updatedData)
          .eq('id', editingService.id)
          .single();
    
        if (error) {
          console.error('Feil ved oppdatering av tjeneste:', error.message);
          alert('Kunne ikke oppdatere tjeneste: ' + error.message);
        } else {
        //   setServices(services.map(service => 
        //     service.id === editingService.id ? data : service
        //   ));
          alert('Tjeneste oppdatert!');
          window.location.reload();
          closeEditModal();
        }
      };

      const openBottomSheetModal = () => {
        setBottomSheetModalOpen(true);
      }

      const handleModalClose = () => {
        setBottomSheetModalOpen(false);
      };

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>MY SERVICES</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {loading && <p>Laster tjenester...</p>}
                {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

                {!loading && !errorMsg && services.length === 0 && (
                <p>Ingen tjenester funnet for denne provider.</p>
                )}

                {!loading && services.length > 0 && (
                        <IonList>
                            {services.map((service) => (
                            <IonItemSliding key={service.id}>
                                <IonItem>
                                <IonLabel>
                                    <h3>{service.title}</h3>
                                    <p>Pris: {service.price}</p>
                                    {service.tags && service.tags.length > 0 && (
                                    <p>Tags: {service.tags.join(', ')}</p>
                                    )}
                                </IonLabel>
                                </IonItem>
                                <IonItemOptions side="end">
                                <IonItemOption color="primary" onClick={() => openEditModal(service)}>
                                    <IonIcon slot="icon-only" icon={pencilOutline} />
                                </IonItemOption>
                                <IonItemOption color="danger" onClick={() => confirmDeleteService(service)}>
                                    <IonIcon slot="icon-only" icon={trashOutline} />
                                </IonItemOption>
                                </IonItemOptions>
                            </IonItemSliding>
                            ))}
                        </IonList>
                    )}
                <div className="my-5">
                    <IonButton onClick={navigateToDetailsOnly}>
                        Add services
                    </IonButton>
                </div>
                <div>
                    <IonButton onClick={openBottomSheetModal}>Åpne bottom</IonButton>
                </div>
                <BottomSheetModal title="TestModal" isOpen={bottomSheetModalOpen} onClose={handleModalClose} onBackdropClick={handleModalClose} breakpoints={[0.95]} initialBreakpointIndex={1}>
                    <AddServiceForm providerId={providerID} />
                </BottomSheetModal>
                <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Bekreft sletting'}
          message={`Er du sikker på at du vil slette tjenesten "${serviceToDelete?.title}"?`}
          buttons={[
            {
              text: 'Avbryt',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                setShowAlert(false);
              },
            },
            {
              text: 'Slett',
              handler: () => {
                handleDeleteService();
              },
            },
          ]}
        />
        <IonModal isOpen={isModalOpen} onDidDismiss={closeEditModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Rediger Tjeneste</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="bottom-sheet-content">
            <IonList>
              <IonItemDivider>Detaljer</IonItemDivider>
              <IonItem>
                <IonLabel position="stacked">Tittel</IonLabel>
                <IonInput
                  value={editedTitle}
                  onIonInput={(e) => setEditedTitle(e.detail.value)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Pris</IonLabel>
                <IonInput
                  type="number"
                  value={editedPrice}
                  onIonInput={(e) => setEditedPrice(e.detail.value)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Tags (kommaseparert)</IonLabel>
                <IonInput
                  value={editedTags}
                  onIonInput={(e) => setEditedTags(e.detail.value)}
                />
              </IonItem>
            </IonList>
            <IonButton expand="block" onClick={handleSaveEdit}>
              Lagre endringer
            </IonButton>
            <IonButton expand="block" color="medium" onClick={closeEditModal}>
              Avbryt
            </IonButton>
          </IonContent>
        </IonModal>
            </IonContent>
        </IonPage>
    )
}