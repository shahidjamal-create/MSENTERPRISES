import { useEffect, useState } from 'react';
import { catalogApi } from '../services/api';
import { Select } from './ui/Form';

let brandCache = null;
const modelCache = new Map();

export function useBrands() {
  const [brands, setBrands] = useState(brandCache || []);
  const [loading, setLoading] = useState(!brandCache);
  useEffect(() => {
    if (brandCache) return;
    catalogApi
      .brands()
      .then((data) => {
        brandCache = data;
        setBrands(data);
      })
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);
  return { brands, loading };
}

export function useModels(brandId) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!brandId) {
      setModels([]);
      return;
    }
    if (modelCache.has(brandId)) {
      setModels(modelCache.get(brandId));
      return;
    }
    let cancelled = false;
    setLoading(true);
    catalogApi
      .models({ brand_id: brandId })
      .then((data) => {
        modelCache.set(brandId, data);
        if (!cancelled) setModels(data);
      })
      .catch(() => !cancelled && setModels([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [brandId]);
  return { models, loading };
}

// Brand → model selector backed by the catalogue API.
export default function ModelPicker({ brandId, modelId, onChange, layout = 'row' }) {
  const { brands, loading: brandsLoading } = useBrands();
  const { models, loading: modelsLoading } = useModels(brandId);

  return (
    <div className={layout === 'row' ? 'grid gap-3 sm:grid-cols-2' : 'space-y-3'}>
      <Select
        aria-label="Phone brand"
        value={brandId || ''}
        onChange={(e) => onChange({ brandId: e.target.value, modelId: '' })}
        disabled={brandsLoading}
      >
        <option value="">{brandsLoading ? 'Loading brands…' : 'Select phone brand'}</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Phone model"
        value={modelId || ''}
        onChange={(e) => onChange({ brandId, modelId: e.target.value })}
        disabled={!brandId || modelsLoading}
      >
        <option value="">{!brandId ? 'Select brand first' : modelsLoading ? 'Loading models…' : models.length ? 'Select model' : 'No models listed yet'}</option>
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
