import Footer from '../../components/layout/Footer';
import HeroSection from './components/HeroSection';
import BenefitsSection from './components/BenefitsSection';
import AvailabilitySection from './components/AvailabilitySection';
import PoolsMapSection from './components/PoolsMapSection';
import { buildCalendar, buildFilteredSedes, buildFilters, buildMapSedes } from './publicSiteSelectors';
import { FILTER_DEFS, OMAPED, directionsUrlFor } from '../../services/sedesService';

export default function PublicSite({ state, actions }) {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <AvailabilitySection
        calendar={buildCalendar(state, actions)}
        filters={buildFilters(FILTER_DEFS, state.activeFilter, actions)}
        sedes={buildFilteredSedes(state, actions)}
        omaped={{ ...OMAPED, directionsUrl: directionsUrlFor(OMAPED) }}
      />
      <PoolsMapSection mapSedes={buildMapSedes()} />
      <Footer />
    </>
  );
}
