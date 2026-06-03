import EkikiGwe from "../../ekiki-gwe.jsx";

export default function JoinRoomPage({ code }) {
  return <EkikiGwe initialJoinCode={code} />;
}

export async function getServerSideProps(context) {
  return {
    props: {
      code: String(context.params?.code || "").toUpperCase(),
    },
  };
}