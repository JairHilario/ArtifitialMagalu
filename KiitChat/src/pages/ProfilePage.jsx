import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Escolhe um arquivo de imagem (png, jpg, etc.)");
      return;
    }
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Coloca pelo menos o nome 😅");
      return;
    }

    const profile = {
      name: name.trim(),
      bio: bio.trim(),
      avatarName: avatarFile ? avatarFile.name : null,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("userProfile", JSON.stringify(profile));
    if (avatarPreview) {
      localStorage.setItem("userAvatarPreview", avatarPreview);
    }

    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-semibold mb-2 text-white">Criar Perfil</h1>
        <p className="text-slate-400 mb-6 text-sm">
          Preenche o teu perfil para entrar no chat.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Nome
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: Jair"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Bio
            </label>
            <textarea
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              placeholder="Fala um pouco sobre você..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Foto de perfil
            </label>
            <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-700 rounded-xl px-3 py-4 cursor-pointer hover:border-emerald-500 transition">
              <div className="text-center">
                <p className="text-xs text-slate-300">
                  Clique aqui para escolher uma imagem
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  PNG, JPG até ~5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>

            {avatarPreview && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={avatarPreview}
                  alt="preview"
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
                <span className="text-xs text-slate-400">
                  Pré-visualização da foto escolhida.
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm transition"
          >
            Salvar e ir para o chat
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
