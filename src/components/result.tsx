export const Result = ({ email }: { email: string }) => {
  return (
    <div className="flex flex-col justify-center mt-10">
      <div>{email}hoge@aa</div>
      <div className="font-extrabold text-3xl mt-2">
        お申し込みを完了いたしました。
      </div>
    </div>
  );
};
