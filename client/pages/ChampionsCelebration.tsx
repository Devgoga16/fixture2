import { Trophy, Sparkles, Medal, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChampionsCelebration() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`,
                        }}
                    >
                        <Star
                            className="text-yellow-300/30"
                            size={Math.random() * 20 + 10}
                        />
                    </div>
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <div
                    className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
                        }`}
                >
                    <div className="flex justify-center mb-6">
                        <Trophy className="text-yellow-400 w-24 h-24 animate-bounce" />
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 mb-4 drop-shadow-2xl">
                        ¡FELICIDADES!
                    </h1>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        A Nuestros Campeones 2025
                    </h2>
                    <div className="flex justify-center gap-4">
                        <Sparkles className="text-yellow-300 animate-pulse" size={32} />
                        <Medal className="text-amber-400 animate-pulse" size={32} />
                        <Sparkles className="text-yellow-300 animate-pulse" size={32} />
                    </div>
                </div>

                {/* Champions Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* Soccer Champions */}
                    <div
                        className={`transform transition-all duration-1000 delay-300 ${isVisible
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-20 opacity-0"
                            }`}
                    >
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border-4 border-yellow-400/50 shadow-2xl hover:scale-105 transition-transform duration-500 hover:shadow-yellow-400/50">
                            <div className="relative">
                                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg flex items-center gap-2">
                                    <Trophy className="w-6 h-6" />
                                    Campeones
                                </div>
                                <img
                                    src="/images/futbolcampeones.jpg"
                                    alt="Campeones de Fútbol"
                                    className="w-full h-96 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                            <div className="p-8 bg-gradient-to-br from-green-600/90 to-emerald-700/90">
                                <h3 className="text-4xl font-black text-white mb-3 flex items-center gap-3">
                                    <span className="text-5xl">⚽</span>
                                    FÚTBOL
                                </h3>
                                <p className="text-white/90 text-lg font-medium mb-4">
                                    ¡Felicitaciones al equipo campeón de fútbol! Su dedicación,
                                    trabajo en equipo y pasión los llevaron a la victoria.
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="bg-yellow-400 text-green-900 px-4 py-2 rounded-full font-bold text-sm">
                                        🏆 1er Lugar
                                    </span>
                                    <span className="bg-white/20 text-white px-4 py-2 rounded-full font-bold text-sm">
                                        ⭐ RED DE ADORACION Y COMUNICACIONES
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Volleyball Champions */}
                    <div
                        className={`transform transition-all duration-1000 delay-500 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
                            }`}
                    >
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border-4 border-yellow-400/50 shadow-2xl hover:scale-105 transition-transform duration-500 hover:shadow-yellow-400/50">
                            <div className="relative">
                                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg flex items-center gap-2">
                                    <Trophy className="w-6 h-6" />
                                    Campeones
                                </div>
                                <img
                                    src="/images/voleycampeon2.jpg"
                                    alt="Campeones de Vóley"
                                    className="w-full h-96 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>
                            <div className="p-8 bg-gradient-to-br from-orange-600/90 to-red-600/90">
                                <h3 className="text-4xl font-black text-white mb-3 flex items-center gap-3">
                                    <span className="text-5xl">🏐</span>
                                    VÓLEY
                                </h3>
                                <p className="text-white/90 text-lg font-medium mb-4">
                                    ¡Felicitaciones al equipo campeón de vóley! Su esfuerzo,
                                    coordinación y espíritu deportivo los hicieron merecedores del
                                    título.
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="bg-yellow-400 text-orange-900 px-4 py-2 rounded-full font-bold text-sm">
                                        🏆 1er Lugar
                                    </span>
                                    <span className="bg-white/20 text-white px-4 py-2 rounded-full font-bold text-sm">
                                        ⭐ RED DE ADOLESCENTES / DOULOS
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer message */}
                <div
                    className={`text-center mt-16 transform transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                        }`}
                >
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-4xl mx-auto border-2 border-white/30 shadow-2xl">
                        <h3 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-4">
                            ¡Orgullo y Gloria!
                        </h3>
                        <p className="text-white text-xl md:text-2xl font-medium leading-relaxed">
                            Celebramos el esfuerzo, la dedicación y el espíritu deportivo de
                            todos nuestros campeones. ¡Su victoria es inspiración para todos!
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            {[...Array(5)].map((_, i) => (
                                <Trophy
                                    key={i}
                                    className="text-yellow-400 animate-pulse"
                                    size={32}
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.6;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
        </div>
    );
}
