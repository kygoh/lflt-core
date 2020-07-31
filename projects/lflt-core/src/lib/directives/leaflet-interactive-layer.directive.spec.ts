import { LeafletInteractiveLayerDirective } from './leaflet-interactive-layer.directive';

describe('LeafletInteractiveLayerDirective', (): void => {
  it('should create an instance', (): void => {
    const directive: LeafletInteractiveLayerDirective = new LeafletInteractiveLayerDirective();
    expect(directive).toBeTruthy();
  });
});
