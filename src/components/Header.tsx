const Header = () => {
  return (
    <header className="p-3 box-border">
      <nav className="flex justify-center">
        <div className="text-center">
          <p className="text-xl mb-5 font-bold">IMG EDITOR</p>
          <p>마우스로 이미지 위를 드래그 해서</p>
          <p>특정 부분을 가릴 수 있습니다</p>
        </div>
      </nav>
    </header>
  );
};

export default Header;
