import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1IjoiZ3BhbGFjaW9zMjYiLCJhIjoiY2tsMXFpMWJuMGdkczJwcWlqaTlnazB0ayJ9.z4qdH8NbXAtndsgkNAqQlQ';

export const useMapbox = (puntoInicial) => {

    // Referencia al DIV del mapa
    const mapaDiv = useRef();
    const setRef = useCallback((node) => {
        mapaDiv.current = node;
    }, []);

    // Referencia a los marcadores
    const marcadores = useRef({});

    // Observables RXJS
    const movimientoMarcador = useRef(new Subject());
    const nuevoMarcador = useRef(new Subject());

    // Referencia al mapa y coordenadas
    const mapa = useRef();
    const [coords, setCoords] = useState(puntoInicial);

    // Función para agregar marcadores
    const agregarMarcador = useCallback((event, id) => {
        const { lng, lat } = event.lngLat || event;
        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4();

        marker.setLngLat([lng, lat]).addTo(mapa.current).setDraggable(true);

        // Asignamos al objeto de marcadores
        marcadores.current[marker.id] = marker;

        // Emitir nuevo marcador
        if (!id) {
            nuevoMarcador.current.next({
                id: marker.id,
                lng, lat
            });
        }

        // Escuchar movimientos del marcador
        marker.on('drag', ({ target }) => {
            const { id } = target;
            const { lng, lat } = target.getLngLat();

            // Emitir los cambios del marcador
            movimientoMarcador.current.next({
                id, lng, lat
            });
        });
    }, []);

    // Función para actualizar marcador
    const actualizarPosicion = useCallback(({ id, lng, lat }) => {
        marcadores.current[id].setLngLat([lng, lat]);
    }, []);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [puntoInicial.lng, puntoInicial.lat],
            zoom: puntoInicial.zoom
        });

        mapa.current = map;
    }, [puntoInicial]);

    // Cuando se mueve el mapa
    useEffect(() => {
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter();
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            });
        });
    }, []);

    // Agregar marcadores cuando se hace click
    useEffect(() => {
        mapa.current?.on('click', (event) => {
            agregarMarcador(event);
        });
    }, [agregarMarcador]);

    return {
        coords,
        marcadores,
        setRef,
        agregarMarcador,
        actualizarPosicion,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current
    }
}
