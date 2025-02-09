import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const ModelViewer: React.FC = () => {


    useEffect(() => {

        // Select the canvas element with class "display__canvas"
        const canvas = document.querySelector<HTMLCanvasElement>('.display__canvas')!;
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setClearColor(0xD1D5DD, 1);

        // Camera (PerspectiveCamera)
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        camera.position.set(0, 40, 80);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Load the OBJ model
        let model: THREE.LineSegments | null = null;
        const objLoader = new OBJLoader();

        objLoader.load(
            './body.obj',
            (object) => {
                object.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;

                        // Step 1: Create wireframe geometry from the mesh
                        const wireframeGeometry = new THREE.WireframeGeometry(mesh.geometry);

                        // Step 2: Assign gradient colors to vertices
                        const positions = wireframeGeometry.attributes.position.array;
                        const colors: number[] = [];
                        const color1 = new THREE.Color(0x00ffff); // Cyan
                        const color2 = new THREE.Color(0x800080); // Purple
                        const color3 = new THREE.Color(0xff1493); // Pink

                        for (let i = 0; i < positions.length; i += 1) {
                            const x = positions[i];
                            const y = positions[i + 1];
                            const z = positions[i + 2];

                            // Normalize position values to [0, 1] for interpolation
                            // Adjust normalization based on your model's scale
                            const t = (y + 10) / 50;

                            const color = new THREE.Color();
                            if (t < 0.5) {
                                color.lerpColors(color1, color2, t * 2); // Cyan to Purple
                            } else {
                                color.lerpColors(color2, color3, (t - 0.5) * 2); // Purple to Pink
                            }
                            
                            colors.push(color.r, color.g, color.b);
                        }

                        // Add the colors as an attribute to the geometry
                        wireframeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                        // Step 3: Create a material that uses vertex colors
                        const wireframeMaterial = new THREE.LineBasicMaterial({
                            vertexColors: true, // Enable vertex colors
                        });

                        // Step 4: Create the wireframe object
                        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

                        // Replace the original mesh with the wireframe
                        wireframe.scale.set(1, 1, 1);
                        wireframe.position.set(0, 0, 0);
                        model = wireframe;
                        scene.add(wireframe);
                        renderer.render(scene, camera);

                        setTimeout(() => {
                            // camera.position.z += 10
                        }, 100);
                    }
                });
            },
            (xhr) => {
                console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
            },
            (error) => {
                console.error('An error happened while loading the model:', error);
            }
        );

        // Create a grid helper
        const grainSize = 2;  // Size of each grain block
        const density = 0.048;  // Density factor (0.0 = no noise, 1.0 = full noise)
        const backgroundColor = 0xD1D5DD;  // Light gray

        // Generate the grainy noise texture
        const noiseCanvas = generateGrainyNoiseTexture(window.innerHeight, window.innerWidth, grainSize, density);

        // Convert the canvas to a Three.js texture
        const noiseTexture = new THREE.CanvasTexture(noiseCanvas);

        // Set the noise texture as the scene background
        scene.background = noiseTexture;
        renderer.render(scene, camera);

        // Handle window resizing
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.render(scene, camera);
        });

        // Initial render (in case the model takes time to load)
        renderer.render(scene, camera);


        document.querySelectorAll('.wellness_report__item').forEach((it, i) => {
            it.addEventListener('click', function (e) {
                it.getAttribute('id') === 'upper' ? upperBodyReport(it) : lowerBodyReport(it);
            });
        });


        let isAnimating = false; // Tracks whether an animation is in progress
        let active: 'none' | 'upper' | 'lower' = 'none'; // Tracks the active state (none, upper, lower)

        function upperBodyReport(it: Element) {
            document.querySelector('#lower')?.classList.remove('active');
            if (active === 'upper') {
                document.querySelector('#upper')?.classList.remove('active');
                defaultZoom();
                return;
            } else {
                document.querySelector('#upper')?.classList.add('active');
                document.querySelector('.wellness_report__card__issues_count')?.classList.remove('hidden');
                (document.querySelector('.wellness_report__card__issues_count') as HTMLElement).innerText = '+3';

                const targetPosition = { y: -20, z: 50 };
                smoothTransition(targetPosition, 'upper');
            }
        }

        function lowerBodyReport(it: Element) {
            document.querySelector('#upper')?.classList.remove('active');
            if (active === 'lower') {
                defaultZoom();
                document.querySelector('#lower')?.classList.remove('active');
                return;
            } else {
                document.querySelector('#lower')?.classList.add('active');
                document.querySelector('.wellness_report__card__issues_count')?.classList.remove('hidden');
                (document.querySelector('.wellness_report__card__issues_count') as HTMLElement).innerText = '+1';

                const targetPosition = { y: 0, z: 50 };
                smoothTransition(targetPosition, 'lower');
            }
        }

        function defaultZoom() {
            const targetPosition = { y: 0, z: 0 };
            document.querySelector('.wellness_report__card__issues_count')?.classList.add('hidden');
            smoothTransition(targetPosition, 'none');
        }

        function smoothTransition(targetPosition: { y: number, z: number }, newActiveState: typeof active) {
            if (isAnimating) return;
            isAnimating = true;

            const duration = 300; // Duration of the animation in milliseconds
            const start = Date.now();
            const startPosition = { y: model?.position.y ?? 0, z: model?.position.z ?? 0 };

            function animate() {
                const elapsed = Date.now() - start;
                const t = Math.min(elapsed / duration, 1);

                if (model) {
                    model.position.y = startPosition.y + (targetPosition.y - startPosition.y) * t;
                    model.position.z = startPosition.z + (targetPosition.z - startPosition.z) * t;
                }

                renderer.render(scene, camera);

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    isAnimating = false;
                    active = newActiveState;
                }
            }

            animate();
        }

        const controls = {
            zoomStep: 10,
            zoomIn() {
                if (model && model.position.z < 70) {
                    const targetPosition = { y: model.position.y, z: (model.position.z + this.zoomStep) };
                    smoothTransition(targetPosition, active);
                }
            },
            zoomOut() {
                if (model && model.position.z > -30) {
                    const targetPosition = { y: model.position.y, z: (model.position.z - this.zoomStep) };
                    smoothTransition(targetPosition, active);
                }
            },
            toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                    document.querySelector('.controls__full_screen')?.classList.add('active');
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                        document.querySelector('.controls__full_screen')?.classList.remove('active');
                    }
                }
            },
        };

        // Event listeners for buttons
        document.querySelector('.controls__zoom_in')?.addEventListener('click', () => controls.zoomIn());
        document.querySelector('.controls__zoom_out')?.addEventListener('click', () => controls.zoomOut());
        document.querySelector('.controls__full_screen')?.addEventListener('click', () => controls.toggleFullscreen());
        document.querySelector('#menu')?.addEventListener('click', () => (document.querySelector('.navbar')as HTMLElement).style.display='flex');
        document.querySelector('.navbar__cross')?.addEventListener('click', () => (document.querySelector('.navbar')as HTMLElement).style.display='none');
       
        // Function to generate a grainy noise texture with controlled density
        function generateGrainyNoiseTexture(width = 256, height = 256, grainSize = 8, density = 0.2): HTMLCanvasElement {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d')!;

            const imageData = context.createImageData(width, height);
            const data = imageData.data;

            const bgColor = new THREE.Color(backgroundColor);
            const bgR = bgColor.r * 255;
            const bgG = bgColor.g * 255;
            const bgB = bgColor.b * 255;

            for (let y = 0; y < height; y += grainSize) {
                for (let x = 0; x < width; x += grainSize) {
                    const noiseValue = Math.random() * 255;
                    const blendedR = bgR + (noiseValue - bgR) * density;
                    const blendedG = bgG + (noiseValue - bgG) * density;
                    const blendedB = bgB + (noiseValue - bgB) * density;

                    for (let gy = 0; gy < grainSize; gy++) {
                        for (let gx = 0; gx < grainSize; gx++) {
                            const index = ((y + gy) * width + (x + gx)) * 4;
                            if (index >= data.length) continue;

                            data[index] = blendedR;
                            data[index + 1] = blendedG;
                            data[index + 2] = blendedB;
                            data[index + 3] = 255;
                        }
                    }
                }
            }

            context.putImageData(imageData, 0, 0);
            return canvas;
        }
    }, []);

   
    return <canvas className="display__canvas"></canvas> ;
};

export default ModelViewer;