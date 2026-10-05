import React from 'react';

const formSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  textAlign: 'left',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-muted)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

interface ProfileJavaSectionProps {
  javaArgs: string;
  setJavaArgs: (val: string) => void;
  javaPath: string;
  setJavaPath: (val: string) => void;
}

export function ProfileJavaSection({
  javaArgs,
  setJavaArgs,
  javaPath,
  setJavaPath,
}: Readonly<ProfileJavaSectionProps>) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: 16,
      }}
    >
      <div style={formSectionStyle}>
        <label htmlFor="profile-java-args" style={labelStyle}>
          Argumentos JVM Personalizados
        </label>
        <input
          id="profile-java-args"
          type="text"
          value={javaArgs}
          onChange={(e) => setJavaArgs(e.target.value)}
          placeholder="-XX:+UseG1GC ..."
        />
      </div>
      <div style={formSectionStyle}>
        <label htmlFor="profile-java-path" style={labelStyle}>
          Ruta de Java ejecutable (Opcional)
        </label>
        <input
          id="profile-java-path"
          type="text"
          value={javaPath}
          onChange={(e) => setJavaPath(e.target.value)}
          placeholder="C:/Program Files/Java/.../java.exe"
        />
      </div>
    </div>
  );
}
