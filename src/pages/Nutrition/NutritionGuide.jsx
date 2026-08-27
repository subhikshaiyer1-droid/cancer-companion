import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Apple, Droplet, Flame, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Plus } from 'lucide-react';

export const NutritionGuide = () => {
  const { addToast } = useTheme();

  const [waterGlasses, setWaterGlasses] = useState(5);
  const [targetCalorie] = useState(1950);

  const recipes = [
    {
      id: 1,
      title: 'Soothing Ginger & Lemon Broth',
      category: 'Anti-Nausea',
      prepTime: '15 mins',
      benefit: 'Relieves chemotherapy morning sickness and keeps electrolytes balanced.',
      ingredients: ['Fresh ginger root', 'Organic vegetable broth', 'Squeeze of fresh lemon', 'Pinch of sea salt']
    },
    {
      id: 2,
      title: 'High-Protein Berry Avocado Smoothie',
      category: 'High Protein',
      prepTime: '5 mins',
      benefit: 'Delivers 22g of clean protein and healthy fats for muscle recovery.',
      ingredients: ['1/2 ripe avocado', '1 cup frozen blueberries', 'Unsweetened almond milk', '1 scoop plant protein powder']
    },
    {
      id: 3,
      title: 'Creamy Sweet Potato & Carrot Soup',
      category: 'Soft Foods',
      prepTime: '25 mins',
      benefit: 'Gentle on sore throat and mucosal tissues, loaded with Beta-Carotene.',
      ingredients: ['Steamed sweet potatoes', 'Carrots', 'Coconut milk', 'Mild turmeric']
    }
  ];

  const foodsToAvoid = [
    { title: 'Undercooked Meats & Eggs', reason: 'High risk of bacterial infection during neutropenia cell count dips.' },
    { title: 'Unpasteurized Dairy or Juices', reason: 'Can harbor harmful bacteria like Listeria.' },
    { title: 'Overly Spicy or Highly Acidic Foods', reason: 'Aggravates mucositis (mouth sores) caused by radiation or chemo.' },
    { title: 'Excessive Refined Sugars', reason: 'Causes rapid blood sugar spikes and increases systemic inflammation.' }
  ];

  const addWater = () => {
    if (waterGlasses < 10) {
      setWaterGlasses(prev => prev + 1);
      addToast('Hydration Logged', 'Added +1 glass of water. Fluid balance supported!', 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Apple className="w-8 h-8 text-emerald-500" /> Nutrition & Hydration Guide
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Nourishing recipes, dietary guidance, hydration tracking, and safe eating protocols
          </p>
        </div>
      </div>

      {/* Grid: Hydration & Calorie Calculator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hydration Tracker */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                  <Droplet className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Daily Hydration Counter</h3>
              </div>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{waterGlasses} / 8 Glasses</span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Proper fluid intake helps prevent chemo-related kidney stress and reduces nausea.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 rounded-2xl flex items-center justify-center transition-all ${
                    i < waterGlasses
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Droplet className="w-5 h-5 fill-current" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={addWater}
            className="w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Drink Water (+1 Glass)
          </button>
        </div>

        {/* Daily Calorie & Nutrition Target Card */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Daily Calorie Target</h3>
              </div>
              <span className="text-sm font-extrabold text-amber-600">{targetCalorie} kcal</span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Maintaining lean tissue mass is key during chemotherapy cycles.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Protein Target</span>
                <span className="font-semibold text-emerald-600">75g - 90g / day</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Fiber Target</span>
                <span className="font-semibold text-sky-600">25g / day</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Electrolytes</span>
                <span className="font-semibold text-purple-600">Potassium & Magnesium rich</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Healthy Recipes Section */}
      <div className="rounded-3xl glass-card p-6 shadow-pastel">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" /> Cancer-Care Recommended Recipes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  {recipe.category}
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-2">{recipe.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{recipe.benefit}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Key Ingredients:</span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-4">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Foods to Avoid Protocol */}
      <div className="p-6 rounded-3xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 text-rose-950 dark:text-rose-200">
        <h3 className="text-base font-bold flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-rose-500" /> Foods & Ingredients to Avoid During Treatment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {foodsToAvoid.map((item, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/60">
              <strong className="text-rose-600 dark:text-rose-400 block">{item.title}</strong>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
