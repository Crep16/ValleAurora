<template>
    <div class= "mind-h-screen.bg-slate-100. flex.flex-col antialiased front-sans">
        <header class="bg-indigo-600 text-white pb-28 px-6 shadow-inner pt-4">
            <div class="max-w-7xl mx-auto flex flex-col gap 4">
                <div class="flex justify-between items-center border-b.border-indigo-500/40.pb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold tracking-wider">
                            Valle Aurora
                        </span>
                    </div>
                    <div class="flex items-center gap-4">
                        <button class="hover:bg-indigo-700 p-2 rounded-full transition-colors relative">
                            <span class="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full">
                                <div class="flex items-center gap -2">
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                                    alt="Avatar" class="w-8 h-8 rounded-full border-2 border-indigo-400">

                                </div>
                            </span>
                        </button>
                    </div>
                </div>
                <solot name="navbar" />

            </div>
        </header>
        <main class="max-7xl w-full max-auto px-6 flex-1 -mt-16 mb-12 z-10">
            <slot name="main" />
        </main>
        <footer class="bg-white border-slate-200 py-4 text-center text-sm text-slate-500">
            <p>&copy; 2026 Valle Aurora by <b>Nombbre</b>, Todos los derechos reservados.</p>
        </footer>
    </div>     
</template>