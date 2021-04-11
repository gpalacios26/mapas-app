import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';

const puntoInicial = {
    lng: -75.4121,
    lat: -10.6440,
    zoom: 10
};

export const MapaPage = () => {

    const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox(puntoInicial);

    const { socket } = useContext(SocketContext);

    useEffect(() => {
        socket.on('marcadores-activos', (marcadores) => {
            for (const key of Object.keys(marcadores)) {
                agregarMarcador(marcadores[key], key);
            }
        });
    }, [socket, agregarMarcador]);

    useEffect(() => {
        nuevoMarcador$.subscribe(marcador => {
            socket.emit('marcador-nuevo', marcador);
        });
    }, [nuevoMarcador$, socket]);

    useEffect(() => {
        movimientoMarcador$.subscribe(marcador => {
            socket.emit('marcador-actualizado', marcador);
        });
    }, [movimientoMarcador$, socket]);

    useEffect(() => {
        socket.on('marcador-nuevo', (marcador) => {
            agregarMarcador(marcador, marcador.id);
        });
    }, [socket, agregarMarcador]);

    useEffect(() => {
        socket.on('marcador-actualizado', (marcador) => {
            actualizarPosicion(marcador);
        });
    }, [socket, actualizarPosicion]);

    return (
        <>
            <div className="info">
                Lng: {coords.lng} | Lat: {coords.lat} | Zoom: {coords.zoom}
            </div>
            <div ref={setRef} className="mapContainer"></div>
        </>
    )
}